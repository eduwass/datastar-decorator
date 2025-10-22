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
  // Matches: data-attr, data-bind:foo, data-on:click, etc.
  const attributePattern = new RegExp(
    `\\b(${DATASTAR_ATTRIBUTES.join('|')})(?::[\\w-]+)?(?:__[\\w.-]+)*\\s*=`,
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
