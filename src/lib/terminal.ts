const ESC = "\x1B";

export const ENTER_ALT_SCREEN = `${ESC}[?1049h`;
export const EXIT_ALT_SCREEN = `${ESC}[?1049l`;
export const HIDE_CURSOR = `${ESC}[?25l`;
export const SHOW_CURSOR = `${ESC}[?25h`;
