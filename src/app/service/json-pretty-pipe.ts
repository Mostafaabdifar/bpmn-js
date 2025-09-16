import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'jsonPretty',
})
export class JsonPrettyPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any): SafeHtml {
    try {
      const obj = typeof value === 'string' ? JSON.parse(value) : value;
      const json = JSON.stringify(obj, null, 2);
      const highlighted = this.syntaxHighlight(json);
      // خروجی رو امن کن
      return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    } catch {
      const escaped = value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return this.sanitizer.bypassSecurityTrustHtml(
        `<span class="error">JSON نامعتبر:</span>\n${escaped}`
      );
    }
  }

  private syntaxHighlight(json: string): string {
    if (!json) return '';
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'number';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'key' : 'string';
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }
}
