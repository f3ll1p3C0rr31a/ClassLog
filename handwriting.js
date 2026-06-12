(() => {
  const DOCUMENT_VERSION = 1;
  const WORLD_WIDTH = 1600;
  const WORLD_HEIGHT = 1000;
  const COLORS = ['#132f45', '#1f7a36', '#0f4ea8', '#b3261e', '#7b1fa2', '#f4b400'];

  let modal;
  let canvas;
  let context;
  let documentData;
  let undoStack = [];
  let redoStack = [];
  let activeStroke = null;
  let activeEraserPointer = null;
  let activePointers = new Map();
  let viewport = { zoom: 1, x: 0, y: 0 };
  let tool = 'pen';
  let color = COLORS[0];
  let width = 5;
  let onSave = null;
  let readOnly = false;
  let lastTouchDistance = 0;

  function emptyDocument() {
    return {
      version: DOCUMENT_VERSION,
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      strokes: [],
      updatedAt: new Date().toISOString(),
    };
  }

  function normalizeDocument(value) {
    if (!value || !Array.isArray(value.strokes)) return emptyDocument();
    return {
      version: DOCUMENT_VERSION,
      width: Number(value.width) || WORLD_WIDTH,
      height: Number(value.height) || WORLD_HEIGHT,
      strokes: value.strokes.map((stroke) => ({
        tool: ['pen', 'highlighter', 'eraser'].includes(stroke.tool) ? stroke.tool : 'pen',
        color: String(stroke.color || COLORS[0]),
        width: Math.max(1, Number(stroke.width) || 5),
        points: Array.isArray(stroke.points) ? stroke.points.map((point) => ({
          x: Number(point.x) || 0,
          y: Number(point.y) || 0,
          pressure: Math.max(0.1, Number(point.pressure) || 0.5),
        })) : [],
      })).filter((stroke) => stroke.points.length > 0),
      updatedAt: value.updatedAt || new Date().toISOString(),
    };
  }

  function injectUi() {
    if (document.getElementById('handwritingModal')) return;

    modal = document.createElement('section');
    modal.id = 'handwritingModal';
    modal.className = 'handwriting-modal hidden';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="handwriting-header">
        <div>
          <p class="eyebrow">Anotação manuscrita</p>
          <strong>Use a S Pen ou Apple Pencil</strong>
        </div>
        <div class="handwriting-header-actions">
          <button class="ghost-button" type="button" data-handwriting-action="cancel">Fechar</button>
          <button class="primary-button" type="button" data-handwriting-action="save">Concluir</button>
        </div>
      </div>
      <div class="handwriting-toolbar" role="toolbar" aria-label="Ferramentas de escrita">
        <button type="button" class="chip active" data-handwriting-tool="pen">Caneta</button>
        <button type="button" class="chip" data-handwriting-tool="highlighter">Marca-texto</button>
        <button type="button" class="chip" data-handwriting-tool="eraser">Borracha</button>
        <button type="button" class="ghost-button" data-handwriting-action="undo">Desfazer</button>
        <button type="button" class="ghost-button" data-handwriting-action="redo">Refazer</button>
        <button type="button" class="ghost-button danger" data-handwriting-action="clear">Limpar</button>
        <label class="handwriting-width">Espessura
          <input type="range" min="2" max="32" value="5" data-handwriting-width />
        </label>
        <div class="handwriting-colors" aria-label="Cores"></div>
        <span class="handwriting-zoom">100%</span>
      </div>
      <div class="handwriting-stage">
        <canvas id="handwritingCanvas" width="${WORLD_WIDTH}" height="${WORLD_HEIGHT}"></canvas>
        <p class="handwriting-empty">Aproxime a caneta da tela para começar. Use dois dedos para mover ou ampliar.</p>
      </div>
    `;
    document.body.appendChild(modal);

    canvas = modal.querySelector('#handwritingCanvas');
    context = canvas.getContext('2d');
    const colors = modal.querySelector('.handwriting-colors');
    COLORS.forEach((entry, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `handwriting-color ${index === 0 ? 'active' : ''}`;
      button.style.setProperty('--handwriting-color', entry);
      button.dataset.handwritingColor = entry;
      button.setAttribute('aria-label', `Cor ${entry}`);
      colors.appendChild(button);
    });

    modal.addEventListener('click', handleToolbarClick);
    modal.querySelector('[data-handwriting-width]').addEventListener('input', (event) => {
      width = Number(event.target.value);
    });
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', resizeCanvasDisplay);
  }

  function resizeCanvasDisplay() {
    if (!canvas || modal.classList.contains('hidden')) return;
    render();
  }

  function handleToolbarClick(event) {
    const toolButton = event.target.closest('[data-handwriting-tool]');
    if (toolButton && !readOnly) {
      tool = toolButton.dataset.handwritingTool;
      modal.querySelectorAll('[data-handwriting-tool]').forEach((button) => {
        button.classList.toggle('active', button === toolButton);
      });
      return;
    }

    const colorButton = event.target.closest('[data-handwriting-color]');
    if (colorButton && !readOnly) {
      color = colorButton.dataset.handwritingColor;
      modal.querySelectorAll('[data-handwriting-color]').forEach((button) => {
        button.classList.toggle('active', button === colorButton);
      });
      return;
    }

    const action = event.target.closest('[data-handwriting-action]')?.dataset.handwritingAction;
    if (!action) return;
    if (action === 'cancel') close();
    if (action === 'save' && !readOnly) save();
    if (action === 'undo' && !readOnly && undoStack.length) {
      redoStack.push(structuredClone(documentData.strokes));
      documentData.strokes = undoStack.pop() || [];
      render();
    }
    if (action === 'redo' && !readOnly && redoStack.length) {
      undoStack.push(structuredClone(documentData.strokes));
      documentData.strokes = redoStack.pop();
      render();
    }
    if (action === 'clear' && !readOnly && documentData.strokes.length && confirm('Limpar toda a anotação manuscrita?')) {
      pushUndoSnapshot();
      documentData.strokes = [];
      render();
    }
  }

  function pushUndoSnapshot() {
    undoStack.push(structuredClone(documentData.strokes));
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const displayX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const displayY = (event.clientY - rect.top) * (canvas.height / rect.height);
    return {
      x: (displayX - viewport.x) / viewport.zoom,
      y: (displayY - viewport.y) / viewport.zoom,
      pressure: event.pressure > 0 ? event.pressure : 0.5,
    };
  }

  function handlePointerDown(event) {
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY, type: event.pointerType });
    canvas.setPointerCapture(event.pointerId);

    if (event.pointerType === 'pen' && !readOnly) {
      event.preventDefault();
      pushUndoSnapshot();
      if (tool === 'eraser') {
        activeEraserPointer = event.pointerId;
        eraseStrokesAt(canvasPoint(event));
        return;
      }
      activeStroke = {
        tool,
        color,
        width,
        points: [canvasPoint(event)],
      };
      return;
    }

    if (event.pointerType === 'touch' && (activeStroke || activeEraserPointer !== null)) return;
    if (event.pointerType === 'touch' && activePointers.size === 2) {
      const touches = [...activePointers.values()].filter((pointer) => pointer.type === 'touch');
      if (touches.length === 2) lastTouchDistance = Math.hypot(touches[0].x - touches[1].x, touches[0].y - touches[1].y);
    }
  }

  function handlePointerMove(event) {
    const previous = activePointers.get(event.pointerId);
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY, type: event.pointerType });

    if (event.pointerType === 'pen' && activeStroke) {
      event.preventDefault();
      activeStroke.points.push(canvasPoint(event));
      render();
      return;
    }
    if (event.pointerType === 'pen' && activeEraserPointer === event.pointerId) {
      event.preventDefault();
      eraseStrokesAt(canvasPoint(event));
      return;
    }
    if (event.pointerType === 'touch' && (activeStroke || activeEraserPointer !== null)) return;

    const touches = [...activePointers.values()].filter((pointer) => pointer.type === 'touch');
    if (event.pointerType === 'touch' && previous && touches.length === 1) {
      viewport.x += (event.clientX - previous.x) * (canvas.width / canvas.getBoundingClientRect().width);
      viewport.y += (event.clientY - previous.y) * (canvas.height / canvas.getBoundingClientRect().height);
      render();
    } else if (event.pointerType === 'touch' && touches.length === 2) {
      const distance = Math.hypot(touches[0].x - touches[1].x, touches[0].y - touches[1].y);
      if (lastTouchDistance > 0) setZoom(viewport.zoom * (distance / lastTouchDistance));
      lastTouchDistance = distance;
    }
  }

  function handlePointerUp(event) {
    activePointers.delete(event.pointerId);
    if (event.pointerType === 'pen' && activeStroke) {
      if (activeStroke.points.length === 1) activeStroke.points.push({ ...activeStroke.points[0], x: activeStroke.points[0].x + 0.5 });
      documentData.strokes.push(activeStroke);
      activeStroke = null;
      documentData.updatedAt = new Date().toISOString();
      render();
    }
    if (activeEraserPointer === event.pointerId) {
      activeEraserPointer = null;
      documentData.updatedAt = new Date().toISOString();
    }
    if (activePointers.size < 2) lastTouchDistance = 0;
  }

  function handleWheel(event) {
    event.preventDefault();
    setZoom(viewport.zoom * (event.deltaY < 0 ? 1.12 : 0.89));
  }

  function setZoom(nextZoom) {
    viewport.zoom = Math.min(4, Math.max(0.5, nextZoom));
    const label = modal.querySelector('.handwriting-zoom');
    if (label) label.textContent = `${Math.round(viewport.zoom * 100)}%`;
    render();
  }

  function pointToSegmentDistance(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y);
    const ratio = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(point.x - (start.x + ratio * dx), point.y - (start.y + ratio * dy));
  }

  function eraseStrokesAt(point) {
    const radius = Math.max(14, width * 1.5) / viewport.zoom;
    const previousLength = documentData.strokes.length;
    documentData.strokes = documentData.strokes.filter((stroke) => {
      if (stroke.tool === 'eraser') return false;
      if (stroke.points.length === 1) return Math.hypot(point.x - stroke.points[0].x, point.y - stroke.points[0].y) > radius;
      return !stroke.points.slice(1).some((current, index) => (
        pointToSegmentDistance(point, stroke.points[index], current) <= radius
      ));
    });
    if (documentData.strokes.length !== previousLength) render();
  }

  function drawStroke(target, stroke) {
    if (!stroke.points.length) return;
    target.save();
    target.lineCap = 'round';
    target.lineJoin = 'round';
    target.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    target.globalAlpha = stroke.tool === 'highlighter' ? 0.25 : 1;
    target.strokeStyle = stroke.color;

    for (let index = 1; index < stroke.points.length; index += 1) {
      const previous = stroke.points[index - 1];
      const current = stroke.points[index];
      const pressure = (previous.pressure + current.pressure) / 2;
      target.lineWidth = stroke.width * (stroke.tool === 'highlighter' ? 2.4 : 0.55 + pressure);
      target.beginPath();
      target.moveTo(previous.x, previous.y);
      target.lineTo(current.x, current.y);
      target.stroke();
    }
    target.restore();
  }

  function renderTo(target, data, withViewport = false) {
    target.save();
    target.setTransform(1, 0, 0, 1, 0, 0);
    target.clearRect(0, 0, target.canvas.width, target.canvas.height);
    target.fillStyle = '#fffdfa';
    target.fillRect(0, 0, target.canvas.width, target.canvas.height);
    target.strokeStyle = 'rgba(23, 51, 73, 0.08)';
    target.lineWidth = 1;
    for (let y = 50; y < WORLD_HEIGHT; y += 50) {
      target.beginPath();
      target.moveTo(0, y);
      target.lineTo(WORLD_WIDTH, y);
      target.stroke();
    }
    if (withViewport) target.setTransform(viewport.zoom, 0, 0, viewport.zoom, viewport.x, viewport.y);
    data.strokes.forEach((stroke) => drawStroke(target, stroke));
    if (activeStroke) drawStroke(target, activeStroke);
    target.restore();
  }

  function render() {
    if (!context) return;
    renderTo(context, documentData, true);
    const empty = modal.querySelector('.handwriting-empty');
    empty.classList.toggle('hidden', documentData.strokes.length > 0 || Boolean(activeStroke));
  }

  function createPreview(data) {
    const source = document.createElement('canvas');
    source.width = WORLD_WIDTH;
    source.height = WORLD_HEIGHT;
    renderTo(source.getContext('2d'), data, false);

    const preview = document.createElement('canvas');
    preview.width = 960;
    preview.height = 600;
    const previewContext = preview.getContext('2d');
    previewContext.drawImage(source, 0, 0, preview.width, preview.height);
    return preview.toDataURL('image/webp', 0.78);
  }

  function open(data, options = {}) {
    injectUi();
    documentData = normalizeDocument(data);
    undoStack = [];
    redoStack = [];
    viewport = { zoom: 1, x: 0, y: 0 };
    onSave = typeof options.onSave === 'function' ? options.onSave : null;
    readOnly = Boolean(options.readOnly);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('handwriting-open');
    modal.querySelectorAll('[data-handwriting-tool], [data-handwriting-width], [data-handwriting-color], [data-handwriting-action="undo"], [data-handwriting-action="redo"], [data-handwriting-action="clear"]')
      .forEach((element) => { element.disabled = readOnly; });
    modal.querySelector('[data-handwriting-action="save"]').classList.toggle('hidden', readOnly);
    requestAnimationFrame(render);
  }

  function close() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('handwriting-open');
    activeStroke = null;
    activeEraserPointer = null;
    activePointers.clear();
  }

  async function save() {
    documentData.updatedAt = new Date().toISOString();
    const result = {
      data: structuredClone(documentData),
      previewDataUrl: createPreview(documentData),
    };
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      const available = Math.max(0, Number(estimate.quota || 0) - Number(estimate.usage || 0));
      const required = new Blob([JSON.stringify(result)]).size * 1.25;
      if (available > 0 && required > available) {
        alert('Não há espaço suficiente no aparelho para preservar esta anotação.');
        return;
      }
    }
    if (onSave) await onSave(result);
    close();
  }

  function mountButton(container, options = {}) {
    if (!container) return;
    container.innerHTML = '';
    if (options.previewDataUrl) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'handwriting-preview-button';
      const image = document.createElement('img');
      image.src = options.previewDataUrl;
      image.alt = 'Prévia da anotação manuscrita';
      button.appendChild(image);
      button.addEventListener('click', () => open(options.data, options));
      container.appendChild(button);
    }
    if (!options.readOnly) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = options.previewDataUrl ? 'ghost-button' : 'primary-button';
      button.textContent = options.previewDataUrl ? 'Continuar escrevendo' : 'Escrever à mão';
      button.addEventListener('click', () => open(options.data, options));
      container.appendChild(button);
    }
  }

  window.ClassLogHandwriting = {
    emptyDocument,
    normalizeDocument,
    createPreview,
    open,
    mountButton,
  };
})();
