import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './index.css';

declare const chrome: any;

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  @state()
  listToRemove: string[] = [];

  @state()
  userInput: string = '';

  storage = {
    set: async (key: string, value: any) => new Promise<void>((resolve) => chrome.storage.local.set({ [key]: value }, resolve)),
    get: async (key: string) => new Promise<string>((resolve) => chrome.storage.local.get([key], (result: any) => resolve(result[key]))),
    remove: (key: string) => new Promise<void>((resolve) => chrome.storage.local.remove(key, resolve)),
  }

  connectedCallback() {
    super.connectedCallback();
    this.storage.get('list-to-remove').then((result: string) => {
      try {
        const list = JSON.parse(result || "[]") as string[];
        console.log('Got List from storage', list);
        if (Array.isArray(list)) {
          this.listToRemove = list;
        }
      } catch (e) {
        this.listToRemove = [];
      }
    })
  }

  render() {
    return html`
      <div class="card">
        <div>
          Adding ${this.userInput} to the list
        </div>
        <div class="flex flex-col">
          ${this.listToRemove.map((item, idx) => html`<p class="item" @click=${this.onRemoveItem(idx)}>${item}</p>`)}
        </div>
        <input 
          .value=${this.userInput}
          @input=${(e: any) => this.userInput = e.target.value}
        />
        <button @click=${this.onAddItem} part="button">
          Add To List
        </button>
      </div>
    `
  }



  private onAddItem() {
    this.listToRemove = [...this.listToRemove, this.userInput];
    this.storage.set('list-to-remove', JSON.stringify(this.listToRemove));
  }

  private onRemoveItem(idx: number) {
    return () => {
      this.listToRemove = this.listToRemove.filter((_, i) => i !== idx);
      this.storage.set('list-to-remove', JSON.stringify(this.listToRemove));
    }
  }

  static styles = css`
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .flex { display: flex  }    
    .flex-col { flex-direction: column }
    .item {
      flex: 1;
      border: 1px solid #000;
      padding: 2px;
      margin:  0 10px;
      border-radius: 0.25rem;
      margin-bottom: 4px;
      cursor: pointer;
    }

  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
