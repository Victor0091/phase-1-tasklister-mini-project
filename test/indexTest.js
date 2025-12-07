const chai = require('chai');
const expect = chai.expect;

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const babel = require('@babel/core');

describe('Task Lister Application', () => {
  let dom;
  let document;
  let window;
  let form;
  let formInput;
  let taskList;

  before(() => {
    // Load HTML content
    const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');

    // Transform JavaScript using Babel
    const { code: transformedScript } = babel.transformFileSync(
      path.resolve(__dirname, '..', 'src/index.js'),
      { presets: ['@babel/preset-env'] }
    );

    // Initialize JSDOM
    dom = new JSDOM(html, {
      runScripts: "dangerously",
      resources: "usable"
    });

    // Inject the transformed JavaScript into the virtual DOM
    const scriptElement = dom.window.document.createElement("script");
    scriptElement.textContent = transformedScript;
    dom.window.document.body.appendChild(scriptElement);

    // Expose JSDOM globals
    window = dom.window;
    document = dom.window.document;
    global.window = window;
    global.document = document;
    global.navigator = window.navigator;
    global.HTMLElement = window.HTMLElement;
  });

  beforeEach(() => {
    form = document.querySelector('#create-task-form');
    formInput = document.querySelector('#new-task-description');
    taskList = document.querySelector('#tasks');
  });

  describe('DOM Elements', () => {
    it('should have a form element with id "create-task-form"', () => {
      expect(form).to.exist;
      expect(form.id).to.equal('create-task-form');
    });

    it('should have an input element with id "new-task-description"', () => {
      expect(formInput).to.exist;
      expect(formInput.id).to.equal('new-task-description');
    });

    it('should have a task list element with id "tasks"', () => {
      expect(taskList).to.exist;
      expect(taskList.id).to.equal('tasks');
    });
  });

  describe('Form Submission', () => {
    it('should accept user input in the form field', () => {
      formInput.value = 'Buy groceries';
      expect(formInput.value).to.equal('Buy groceries');
    });

    it('should add a task to the list on form submission', () => {
      formInput.value = 'Wash the dishes';
      const event = new window.Event('submit', { bubbles: true });
      form.dispatchEvent(event);
      expect(taskList.textContent).to.include('Wash the dishes');
    });

    it('should clear the input field after submission', () => {
      formInput.value = 'Clean the room';
      const event = new window.Event('submit', { bubbles: true });
      form.dispatchEvent(event);
      expect(formInput.value).to.equal('');
    });

    it('should add multiple tasks to the list', () => {
      formInput.value = 'Task 1';
      form.dispatchEvent(new window.Event('submit', { bubbles: true }));
      
      formInput.value = 'Task 2';
      form.dispatchEvent(new window.Event('submit', { bubbles: true }));
      
      expect(taskList.textContent).to.include('Task 1');
      expect(taskList.textContent).to.include('Task 2');
    });
  });

  describe('Task List Items', () => {
    it('should create list items for submitted tasks', () => {
      formInput.value = 'New task';
      form.dispatchEvent(new window.Event('submit', { bubbles: true }));
      const listItems = taskList.querySelectorAll('li');
      expect(listItems.length).to.be.greaterThan(0);
    });

    it('should display task text in list items', () => {
      formInput.value = 'Important task';
      form.dispatchEvent(new window.Event('submit', { bubbles: true }));
      const listItems = taskList.querySelectorAll('li');
      expect(Array.from(listItems).some(li => li.textContent.includes('Important task'))).to.be.true;
    });
  });
});