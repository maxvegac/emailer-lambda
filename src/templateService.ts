import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { TemplateData } from './types';

export class TemplateService {
  private templatesPath: string;

  constructor(templatesPath: string = path.join(__dirname, 'templates')) {
    this.templatesPath = templatesPath;
  }

  /**
   * Renders a template with the provided data
   */
  async renderTemplate(templateName: string, data: TemplateData): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      
      // Check if file exists
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template '${templateName}' not found at ${templatePath}`);
      }

      // Read template content
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      
      // Compile template with Handlebars
      const template = Handlebars.compile(templateContent);
      
      // Render with data
      return template(data);
    } catch (error) {
      throw new Error(`Error rendering template '${templateName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lists all available templates
   */
  async listTemplates(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.templatesPath);
      return files
        .filter(file => file.endsWith('.hbs'))
        .map(file => file.replace('.hbs', ''));
    } catch (error) {
      throw new Error(`Error listing templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks if a template exists
   */
  async templateExists(templateName: string): Promise<boolean> {
    const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
    return fs.existsSync(templatePath);
  }
}
