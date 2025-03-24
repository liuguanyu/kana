declare module 'svelte' {
  export function getContext(key: any): any;
  export function setContext(key: any, context: any): void;
  export function hasContext(key: any): boolean;
  export function onMount(fn: () => any): void;
  export function onDestroy(fn: () => any): void;
  export function beforeUpdate(fn: () => any): void;
  export function afterUpdate(fn: () => any): void;
  export function tick(): Promise<void>;
  export function createEventDispatcher<T extends Record<string, any>>(): (type: keyof T, detail?: any) => void;
  
  export interface Readable<T> {
    subscribe(run: (value: T) => void): { unsubscribe: () => void };
  }
  
  export interface Writable<T> extends Readable<T> {
    set(value: T): void;
    update(updater: (value: T) => T): void;
  }
  
  export function writable<T>(value: T): Writable<T>;
  export function readable<T>(value: T, start?: (set: (value: T) => void) => () => void): Readable<T>;
  export function derived<T, S>(stores: Readable<S>, fn: (values: S, set?: (value: T) => void) => T | void): Readable<T>;
  
  export interface ATypedSvelteComponent {
    $$prop_def: any;
    $$events_def: any;
    $$slot_def: any;
    $set(props: any): void;
    $on(event: string, callback: (e: any) => void): () => void;
    $destroy(): void;
  }
  
  export type ConstructorOfATypedSvelteComponent = new (args: { target: any; props?: any; }) => ATypedSvelteComponent;
  
  export class SvelteComponentTyped<Props = any, Events = any, Slots = any> {
    constructor(options: { target: HTMLElement; props?: Props; });
    $set(props: Partial<Props>): void;
    $on<K extends keyof Events>(type: K, callback: (e: Events[K]) => void): () => void;
    $destroy(): void;
    
    $$prop_def: Props;
    $$events_def: Events;
    $$slot_def: Slots;
  }
}

declare module 'svelte-spa-router' {
  import { SvelteComponentTyped, Readable, ATypedSvelteComponent, ConstructorOfATypedSvelteComponent } from 'svelte';
  
  export default class Router extends SvelteComponentTyped<{
    routes: Record<string, any>;
    prefix?: string;
    restoreScrollState?: boolean;
  }> {
    $$prop_def: {
      routes: Record<string, any>;
      prefix?: string;
      restoreScrollState?: boolean;
    };
    $$events_def: any;
    $$slot_def: any;
  }
  
  export function push(location: string): void;
  export function pop(): void;
  export function replace(location: string): void;
  export function link(node: HTMLElement, hrefVar: string): { destroy(): void };
  
  export const location: Readable<string>;
}

declare module 'svelte-spa-router/wrap' {
  import { ATypedSvelteComponent, ConstructorOfATypedSvelteComponent } from 'svelte';
  
  interface WrappedComponent {
    component: ConstructorOfATypedSvelteComponent | any;
    props?: Record<string, any>;
    userData?: Record<string, any>;
    conditions?: Array<(details: any) => boolean>;
  }
  
  export function wrap(component: WrappedComponent | ConstructorOfATypedSvelteComponent | any): any;
}

declare module '*.svelte' {
  import { SvelteComponentTyped, ATypedSvelteComponent, ConstructorOfATypedSvelteComponent } from 'svelte';
  
  const component: ConstructorOfATypedSvelteComponent;
  export default component;
}

// 为Svelte 5添加的类型声明
declare namespace svelte {
  namespace $ {
    function createEventDispatcher<T extends Record<string, any>>(): (type: keyof T, detail?: any) => void;
    function effect(fn: () => void | (() => void)): void;
    function state<T>(initialValue: T): { value: T };
    function prop<T>(initialValue?: T): { value: T };
    function readonly<T>(value: T): { value: T };
    function derived<T>(fn: () => T): { value: T };
  }
}
