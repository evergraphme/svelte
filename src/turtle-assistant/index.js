import { all as indentationRules } from './indent-assist';
import { all as shortcutRules } from './shortcut-assist';

export { TurtleAssistant } from './turtle-assistant';
export const assistants = shortcutRules.concat(indentationRules);
