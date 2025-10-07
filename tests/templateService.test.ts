import { TemplateService } from '../src/templateService';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('TemplateService', () => {
  let templateService: TemplateService;

  beforeEach(() => {
    templateService = new TemplateService();
    jest.clearAllMocks();
  });

  describe('renderTemplate', () => {
    it('should render template with data successfully', async () => {
      const templateContent = '<h1>Hello {{name}}!</h1>';
      const templatePath = path.join(__dirname, '../src/templates/test.hbs');
      
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(templateContent);

      const result = await templateService.renderTemplate('test', { name: 'World' });

      expect(result).toBe('<h1>Hello World!</h1>');
      expect(mockedFs.existsSync).toHaveBeenCalledWith(templatePath);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(templatePath, 'utf8');
    });

    it('should throw error when template not found', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      await expect(
        templateService.renderTemplate('non-existent', {})
      ).rejects.toThrow('not found');
    });

    it('should handle template compilation errors', async () => {
      const invalidTemplate = '{{#invalid syntax}}';
      const templatePath = path.join(__dirname, '../src/templates/invalid.hbs');
      
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(invalidTemplate);

      await expect(
        templateService.renderTemplate('invalid', {})
      ).rejects.toThrow();
    });
  });

  describe('listTemplates', () => {
    it('should return list of available templates', async () => {
      const mockFiles = ['template1.hbs', 'template2.hbs', 'other.txt'];
      mockedFs.readdirSync.mockReturnValue(mockFiles as any);

      const result = await templateService.listTemplates();

      expect(result).toEqual(['template1', 'template2']);
    });

    it('should handle directory read errors', async () => {
      mockedFs.readdirSync.mockImplementation(() => {
        throw new Error('Directory not found');
      });

      await expect(templateService.listTemplates()).rejects.toThrow('Error listing templates');
    });
  });

  describe('templateExists', () => {
    it('should return true when template exists', async () => {
      mockedFs.existsSync.mockReturnValue(true);

      const result = await templateService.templateExists('test');

      expect(result).toBe(true);
    });

    it('should return false when template does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = await templateService.templateExists('non-existent');

      expect(result).toBe(false);
    });
  });
});
