'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Bold, Italic, List, ListOrdered, Heading1, Heading2, ImageIcon, 
  Undo, Redo, AlignLeft, AlignCenter, AlignRight, Trash2, Settings2,
  Maximize2, Minimize2
} from 'lucide-react';
import ImageUploadModal, { ImageData } from './ImageUploadModal';

interface Props {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Custom Figure extension with alignment, size, and caption support
const Figure = Image.extend({
  name: 'figure',
  
  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-alignment') || 'center',
        renderHTML: attributes => ({
          'data-alignment': attributes.alignment,
        }),
      },
      size: {
        default: 'medium',
        parseHTML: element => element.getAttribute('data-size') || 'medium',
        renderHTML: attributes => ({
          'data-size': attributes.size,
        }),
      },
      caption: {
        default: '',
        parseHTML: element => element.getAttribute('data-caption') || '',
        renderHTML: attributes => ({
          'data-caption': attributes.caption,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment, size, caption, src, alt, ...rest } = HTMLAttributes;
    
    const sizeClasses: Record<string, string> = {
      small: 'w-1/4',
      medium: 'w-1/2',
      large: 'w-3/4',
      full: 'w-full',
    };

    const alignmentStyles: Record<string, string> = {
      left: 'float-left mr-4 mb-2',
      center: 'mx-auto block clear-both',
      right: 'float-right ml-4 mb-2',
      inline: 'inline-block',
    };

    const figureClass = `figure-wrapper ${sizeClasses[size] || 'w-1/2'} ${alignmentStyles[alignment] || 'mx-auto block'}`;

    return [
      'figure',
      { 
        class: figureClass,
        'data-alignment': alignment,
        'data-size': size,
        'data-caption': caption,
      },
      ['img', { src, alt, class: 'w-full h-auto rounded-lg', ...rest }],
      caption ? ['figcaption', { class: 'text-sm text-gray-600 text-center mt-2 italic' }, caption] : null,
    ].filter(Boolean) as never;
  },
});

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  const isInitialMount = useRef(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Figure.configure({
        HTMLAttributes: {
          class: 'figure-node',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [editor]);

  const handleInsertImage = useCallback((imageData: ImageData) => {
    if (!editor) return;
    
    editor.chain().focus().setImage({
      src: imageData.src,
      alt: imageData.alt,
      // @ts-ignore - custom attributes
      alignment: imageData.alignment,
      size: imageData.size,
      caption: imageData.caption,
    }).run();
    
    setShowImageModal(false);
    setSelectedImage(null);
  }, [editor]);

  const handleEditImage = useCallback(() => {
    if (!editor) return;
    
    const { node } = editor.state.selection as unknown as { node?: { attrs?: ImageData } };
    if (node?.attrs) {
      setSelectedImage({
        src: node.attrs.src || '',
        alt: node.attrs.alt || '',
        caption: node.attrs.caption || '',
        alignment: node.attrs.alignment || 'center',
        size: node.attrs.size || 'medium',
      });
      setShowImageModal(true);
    }
  }, [editor]);

  const updateImageAttribute = useCallback((attr: string, value: string) => {
    if (!editor) return;
    editor.chain().focus().updateAttributes('figure', { [attr]: value }).run();
  }, [editor]);

  const deleteImage = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${editor.isActive('bold') ? 'bg-slate-200' : ''}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${editor.isActive('italic') ? 'bg-slate-200' : ''}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200' : ''}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${editor.isActive('bulletList') ? 'bg-slate-200' : ''}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${editor.isActive('orderedList') ? 'bg-slate-200' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          onClick={() => { setSelectedImage(null); setShowImageModal(true); }}
          className="p-2 rounded hover:bg-slate-200 transition flex items-center gap-1 text-sm"
          title="Insert Figure"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Figure</span>
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-slate-200 transition disabled:opacity-30"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-slate-200 transition disabled:opacity-30"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Image Toolbar - shows when image/figure is selected */}
      {editor && (editor.isActive('figure') || editor.isActive('image')) && (
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-blue-50 flex-wrap">
          <span className="text-xs text-blue-700 font-medium mr-2">Figure Options:</span>
          <div className="flex items-center gap-1 px-2 border-r border-blue-200">
            <span className="text-xs text-gray-500">Align:</span>
            <button
              onClick={() => updateImageAttribute('alignment', 'left')}
              className="p-1.5 rounded hover:bg-blue-100"
              title="Float Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateImageAttribute('alignment', 'center')}
              className="p-1.5 rounded hover:bg-blue-100"
              title="Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateImageAttribute('alignment', 'right')}
              className="p-1.5 rounded hover:bg-blue-100"
              title="Float Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1 px-2 border-r border-blue-200">
            <span className="text-xs text-gray-500">Size:</span>
            <button
              onClick={() => updateImageAttribute('size', 'small')}
              className="p-1.5 rounded hover:bg-blue-100 text-xs font-medium"
              title="Small (25%)"
            >
              S
            </button>
            <button
              onClick={() => updateImageAttribute('size', 'medium')}
              className="p-1.5 rounded hover:bg-blue-100 text-xs font-medium"
              title="Medium (50%)"
            >
              M
            </button>
            <button
              onClick={() => updateImageAttribute('size', 'large')}
              className="p-1.5 rounded hover:bg-blue-100 text-xs font-medium"
              title="Large (75%)"
            >
              L
            </button>
            <button
              onClick={() => updateImageAttribute('size', 'full')}
              className="p-1.5 rounded hover:bg-blue-100 text-xs font-medium"
              title="Full Width"
            >
              F
            </button>
          </div>
          <button
            onClick={handleEditImage}
            className="p-1.5 rounded hover:bg-blue-100"
            title="Edit Figure"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            onClick={deleteImage}
            className="p-1.5 rounded hover:bg-red-100 text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Custom styles for figures */}
      <style jsx global>{`
        .ProseMirror figure {
          margin: 1rem 0;
        }
        .ProseMirror figure[data-alignment="left"] {
          float: left;
          margin-right: 1rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror figure[data-alignment="right"] {
          float: right;
          margin-left: 1rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror figure[data-alignment="center"] {
          display: block;
          margin-left: auto;
          margin-right: auto;
          clear: both;
        }
        .ProseMirror figure[data-alignment="inline"] {
          display: inline-block;
          vertical-align: top;
        }
        .ProseMirror figure[data-size="small"] {
          width: 25%;
        }
        .ProseMirror figure[data-size="medium"] {
          width: 50%;
        }
        .ProseMirror figure[data-size="large"] {
          width: 75%;
        }
        .ProseMirror figure[data-size="full"] {
          width: 100%;
        }
        .ProseMirror figure img {
          width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .ProseMirror figcaption {
          font-size: 0.875rem;
          color: #4b5563;
          text-align: center;
          margin-top: 0.5rem;
          font-style: italic;
        }
        .ProseMirror p::after {
          content: "";
          display: table;
          clear: both;
        }
      `}</style>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => { setShowImageModal(false); setSelectedImage(null); }}
        onInsert={handleInsertImage}
        existingImage={selectedImage}
      />
    </div>
  );
}
