import IEditor from './Editor';
import IRender from './render';
import Clear from './menus/Clear';
import Split from './menus/Split';
import Heading from './menus/Heading';
import FontSize from './menus/FontSize';
import FontName from './menus/FontName';
import FontColor from './menus/FontColor';
import BackColor from './menus/BackColor';
import InsertImage from './menus/InsertImage';
import Emoji from './menus/Emoji';
import cmd from './menus/_cmd.js';

const AlignLeft = cmd('justifyLeft', '居左', 'align-left');
const AlignCenter = cmd('justifyCenter', '居中', 'align-center');
const AlignRight = cmd('justifyRight', '居右', 'align-right');
const Indent = cmd('indent', '缩进', 'indent');
const Unindent = cmd('outdent', '取消缩进', 'unindent');
const OrderList = cmd('insertOrderedList', '编号', 'serial');
const UnorderList = cmd('insertUnorderedList', '列表', 'list');
const BlockQuote = cmd('blockQuote', '引用', 'blockquote', selection => {
    let node = selection.getContainerElem();
    return node && 'BLOCKQUOTE' == node.tagName;
}, editor => editor.blockQuote());
const Bold = cmd('bold', '粗体', 'bold');
const Italic = cmd('italic', '斜体', 'italic');
const Underline = cmd('underline', '下划线', 'underline');
const StrikeThrough = cmd('strikeThrough', '删除线', 'strikeout');
const Supscript = cmd('superscript', '上标', 'superscript');
const Subscript = cmd('subscript', '下标', 'subscript');
const Horizontal = cmd('insertHorizontalRule', '分隔线', 'hr');
const CreateLink = cmd('createLink', '链接', 'link', selection => {
    let node = selection.getContainerElem();
    return node && 'A' == node.tagName;
}, editor => editor.createLink());

export {
    IEditor,
    IRender,
    Clear,
    Split,
    // 段落样式
    AlignLeft,
    AlignCenter,
    AlignRight,
    Indent,
    Unindent,
    OrderList,
    UnorderList,
    BlockQuote,
    // 字体样式
    Bold,
    Italic,
    Underline,
    StrikeThrough,
    Supscript,
    Subscript,
    Horizontal,
    // 颜色样式
    Heading,
    FontName,
    FontSize,
    FontColor,
    BackColor,
    // 其它
    CreateLink,
    InsertImage,
    Emoji,
};