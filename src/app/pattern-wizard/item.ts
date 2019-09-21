export class Item {
  name: string;
  expressions: number;
  template: string;
  description: string;

  text: string;

  public constructor(name: string, expressions: number, template: string, description: string)  {
    this.name = name;
    this.expressions = expressions;
    this.template = template;
    this.description = description;
    this.text = template;
  }

  formatText(expr: string[]) {
    this.text = this.template.replace(/{(\d+)}/g, function(match, number) {
      return typeof expr[number] !== 'undefined' ? expr[number] : match;
    });
    return this.text;
  }

}
