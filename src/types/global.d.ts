/**
 * Declarações globais para ambiente browser (PWA).
 * Necessário para alert, window, etc. em componentes client.
 */
declare function alert(message?: string): void;
declare const window: Window & typeof globalThis;
