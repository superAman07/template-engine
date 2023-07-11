import { ModelManager } from '@accordproject/concerto-core';
import { CommonMarkModel } from '@accordproject/markdown-common';
import { readFileSync } from 'fs-extra';
import { TemplateMarkInterpreter } from '../src';
import { TemplateMarkTransformer } from '@accordproject/markdown-template';
import dayjs from 'dayjs';

describe('template with custom template model', () => {
    test('should create agreementmark from a template and data', async () => {

        /**
         * Define the data model for the template. The model must have a concept with
         * the @template decorator. The types of properties allow the template to be
         * type-checked.
        */
        const model = readFileSync('./test/templates/customtemplatemodel/model.cto', 'utf-8');

        /**
         * Load the template, rich-text with variables, conditional sections etc
         */
        const template = readFileSync('./test/templates/customtemplatemodel/template.md', 'utf-8');

        /**
         * Define the data we will merge with the template - an instance of the template model
         */
        const data = {
            $class: 'helloworld@1.0.0.TemplateData',
            message: 'World',
            gender: 'MALE'
        };
        const modelManager = new ModelManager({ strict: true });
        modelManager.addCTOModel(model);
        const engine = new TemplateMarkInterpreter(modelManager, {}, 'helloworld@1.0.0.TemplateData');

        const templateMarkTransformer = new TemplateMarkTransformer();

        const templateMarkDom = templateMarkTransformer.fromMarkdownTemplate({ content: template }, modelManager, 'contract', { verbose: false }, 'helloworld@1.0.0.TemplateData');
        // console.log(JSON.stringify(templateMarkDom, null, 2));

        const now = '2023-03-17T00:00:00.000Z';
        const ciceroMark = await engine.generate(templateMarkDom, data, {now});
        expect(ciceroMark.getFullyQualifiedType()).toBe(`${CommonMarkModel.NAMESPACE}.Document`);
        expect(ciceroMark.toJSON()).toMatchSnapshot();
        // console.log(JSON.stringify(ciceroMark.toJSON(), null, 2));
    });
});
