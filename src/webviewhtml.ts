import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function getWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
) {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "main.js")
  );
  const stylesMainUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "main.css")
  );

  const vendorHighlightCss = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "highlight.min.css")
  );
  const vendorAutocompleteCss = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "autocomplete.css")
  );
  const vendorHighlightJs = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "highlight.min.js")
  );
  const vendorMarkedJs = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "marked.min.js")
  );
  const vendorTailwindJs = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "media",
      "scripts",
      "tailwindcss.3.2.4.min.js"
    )
  );
  const vendorTurndownJs = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "scripts", "turndown.js")
  );

  // Read HTML file from disk
  const htmlPath = path.join(extensionUri.fsPath, "media", "webview.html");
  let html = fs.readFileSync(htmlPath, "utf-8");

  // Replace placeholders in the HTML file with actual values
  html = html.replace("${scriptUri}", scriptUri.toString());
  html = html.replace("${stylesMainUri}", stylesMainUri.toString());
  html = html.replace("${vendorHighlightCss}", vendorHighlightCss.toString());
  html = html.replace(
    "${vendorAutocompleteCss}",
    vendorAutocompleteCss.toString()
  );
  html = html.replace("${vendorHighlightJs}", vendorHighlightJs.toString());
  html = html.replace("${vendorMarkedJs}", vendorMarkedJs.toString());
  html = html.replace("${vendorTailwindJs}", vendorTailwindJs.toString());
  html = html.replace("${vendorTurndownJs}", vendorTurndownJs.toString());

  // Return the resulting HTML
  return html;
}
