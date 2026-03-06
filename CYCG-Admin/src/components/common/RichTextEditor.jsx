import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

function RichTextEditor({ value, onChange, placeholder = 'Write content...' }) {
  const containerRef = useRef(null)
  const quillRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || quillRef.current) {
      return
    }

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'image'],
            ['blockquote', 'code-block'],
            ['clean'],
          ],
          handlers: {
            image: function imageHandler() {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.click()

              input.onchange = () => {
                const file = input.files?.[0]
                if (!file) return

                if (file.size > 1024 * 1024 * 2) {
                  window.alert('Please select an image up to 2MB.')
                  return
                }

                const reader = new FileReader()
                reader.onload = () => {
                  const range = this.quill.getSelection(true)
                  this.quill.insertEmbed(
                    range?.index ?? 0,
                    'image',
                    String(reader.result),
                    'user',
                  )
                  this.quill.setSelection((range?.index ?? 0) + 1, 0)
                }
                reader.readAsDataURL(file)
              }
            },
          },
        },
      },
    })

    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value)
    }

    quill.on('text-change', () => {
      onChange(quill.root.innerHTML)
    })

    quillRef.current = quill
  }, [onChange, placeholder, value])

  useEffect(() => {
    if (!quillRef.current) {
      return
    }

    const html = value || ''
    if (quillRef.current.root.innerHTML !== html) {
      quillRef.current.root.innerHTML = html
    }
  }, [value])

  return <div className="rich-editor" ref={containerRef} />
}

export default RichTextEditor
