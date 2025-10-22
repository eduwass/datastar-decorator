const vscode = require('vscode');

const DATASTAR_ATTRIBUTES = [
  'data-attr',
  'data-bind',
  'data-class',
  'data-computed',
  'data-effect',
  'data-ignore',
  'data-ignore-morph',
  'data-indicator',
  'data-init',
  'data-json-signals',
  'data-on',
  'data-on-intersect',
  'data-on-interval',
  'data-on-signal-patch',
  'data-on-signal-patch-filter',
  'data-preserve-attr',
  'data-ref',
  'data-show',
  'data-signals',
  'data-style',
  'data-text',
  // Pro attributes
  'data-animate',
  'data-custom-validity',
  'data-on-raf',
  'data-on-resize',
  'data-persist',
  'data-query-string',
  'data-replace-url',
  'data-scroll-into-view',
  'data-view-transition',
  // Aliased versions (data-star-*)
  'data-star-attr',
  'data-star-bind',
  'data-star-class',
  'data-star-computed',
  'data-star-effect',
  'data-star-ignore',
  'data-star-ignore-morph',
  'data-star-indicator',
  'data-star-init',
  'data-star-json-signals',
  'data-star-on',
  'data-star-on-intersect',
  'data-star-on-interval',
  'data-star-on-signal-patch',
  'data-star-on-signal-patch-filter',
  'data-star-preserve-attr',
  'data-star-ref',
  'data-star-show',
  'data-star-signals',
  'data-star-style',
  'data-star-text',
  'data-star-animate',
  'data-star-custom-validity',
  'data-star-on-raf',
  'data-star-on-resize',
  'data-star-persist',
  'data-star-query-string',
  'data-star-replace-url',
  'data-star-scroll-into-view',
  'data-star-view-transition',
];

let decorationType;

function activate(context) {
  console.log('Datastar Decorator extension is now active!');

  // Create decoration type with rocket emoji (simple and clean)
  decorationType = vscode.window.createTextEditorDecorationType({
    before: {
      contentText: '🚀',
      margin: '0 4px 0 0',
    },
  });

  // Initial decoration
  updateDecorations();

  // Update decorations when active editor changes
  vscode.window.onDidChangeActiveTextEditor(
    () => {
      updateDecorations();
    },
    null,
    context.subscriptions
  );

  // Update decorations when document changes
  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
        updateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  // Update decorations when configuration changes
  vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration('datastarDecorator.enabled')) {
        updateDecorations();
      }
    },
    null,
    context.subscriptions
  );
}

function updateDecorations() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  // Check if decoration is enabled
  const config = vscode.workspace.getConfiguration('datastarDecorator');
  const enabled = config.get('enabled', true);
  if (!enabled) {
    editor.setDecorations(decorationType, []);
    return;
  }

  const document = editor.document;
  const decorations = [];

  // Create regex pattern for all Datastar attributes
  // Matches any data-* or data-star-* attribute that:
  // - Starts with data- or data-star-
  // - Has attribute names that match known Datastar attributes OR
  // - Has dynamic suffixes like data-on-blur, data-attr-aria-hidden, data-class:hidden, etc.
  // - Optionally has :key for specific targeting (e.g., data-bind:foo)
  // - Optionally has modifiers like __case.kebab, __debounce.500ms, etc.
  // - Ends with = or whitespace/tag end

  // Escape special regex characters in base attributes
  const baseAttributes = DATASTAR_ATTRIBUTES.map(attr => attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

  // Dynamic patterns for attributes that can have suffixes (e.g., data-on-blur, data-attr-aria-hidden)
  const dynamicPatterns = [
    'data-on-[\\w-]+',      // data-on-blur, data-on-click, etc.
    'data-attr-[\\w-]+',    // data-attr-aria-hidden, data-attr-title, etc.
    'data-class-[\\w-]+',   // data-class:hidden, data-class:foo, etc.
    'data-signals-[\\w-]+', // data-signals:foo, etc.
    'data-bind-[\\w-]+',    // data-bind:foo, etc.
    'data-computed-[\\w-]+',// data-computed:foo, etc.
    'data-style-[\\w-]+',   // data-style:color, etc.
    'data-text-[\\w-]+',    // data-text:foo, etc.
    'data-effect-[\\w-]+',  // data-effect:foo, etc.
    'data-show-[\\w-]+',    // data-show:foo, etc.
    'data-ref-[\\w-]+',     // data-ref:foo, etc.
    'data-indicator-[\\w-]+', // data-indicator:loading, etc.
    'data-init-[\\w-]+',    // data-init:foo, etc.
    'data-preserve-attr-[\\w-]+', // data-preserve-attr:foo, etc.
    'data-star-on-[\\w-]+', // data-star-on-blur, etc.
    'data-star-attr-[\\w-]+', // data-star-attr-aria-hidden, etc.
    'data-star-class-[\\w-]+', // data-star-class:hidden, etc.
    'data-star-signals-[\\w-]+', // data-star-signals:foo, etc.
    'data-star-bind-[\\w-]+', // data-star-bind:foo, etc.
    'data-star-computed-[\\w-]+', // data-star-computed:foo, etc.
    'data-star-style-[\\w-]+', // data-star-style:color, etc.
    'data-star-text-[\\w-]+', // data-star-text:foo, etc.
    'data-star-effect-[\\w-]+', // data-star-effect:foo, etc.
    'data-star-show-[\\w-]+', // data-star-show:foo, etc.
    'data-star-ref-[\\w-]+', // data-star-ref:foo, etc.
    'data-star-indicator-[\\w-]+', // data-star-indicator:loading, etc.
    'data-star-init-[\\w-]+', // data-star-init:foo, etc.
    'data-star-preserve-attr-[\\w-]+', // data-star-preserve-attr:foo, etc.
  ].join('|');

  const attributePattern = new RegExp(
    `\\b(${dynamicPatterns}|${baseAttributes})(?::[\\w-]+)?(?:__[\\w.-]+)*(?:\\s*=|(?=\\s|>))`,
    'gi'
  );

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const text = line.text;

    let match;
    while ((match = attributePattern.exec(text)) !== null) {
      const startPos = new vscode.Position(i, match.index);
      const endPos = new vscode.Position(i, match.index + match[0].length);

      const decoration = {
        range: new vscode.Range(startPos, endPos),
        hoverMessage: new vscode.MarkdownString(
          `**Datastar Attribute** 🚀\n\n` +
          `\`${match[1]}\`\n\n` +
          `[View Documentation](https://data-star.dev/reference/attributes)`
        ),
      };

      decorations.push(decoration);
    }
  }

  editor.setDecorations(decorationType, decorations);
}

function deactivate() {
  if (decorationType) {
    decorationType.dispose();
  }
}

module.exports = { activate, deactivate };
