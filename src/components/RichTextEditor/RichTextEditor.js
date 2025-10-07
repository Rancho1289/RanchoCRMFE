import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const RichTextEditor = ({ 
    value, 
    onChange, 
    placeholder = "내용을 입력하세요...",
    height = "200px",
    readOnly = false 
}) => {
    // Quill 모듈 설정
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['blockquote', 'code-block'],
            ['clean']
        ],
        keyboard: {
            bindings: {
                tab: {
                    key: 9,
                    handler: function(range, context) {
                        // Tab 키 처리
                        return true;
                    }
                }
            }
        }
    }), []);


    // Quill 포맷 설정
    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script', 'list', 'indent', 'direction',
        'align', 'link', 'image', 'video',
        'blockquote', 'code-block'
    ];

    return (
        <div className="rich-text-editor" style={{ height: height }}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                readOnly={readOnly}
                style={{ height: `calc(${height} - 42px)` }}
            />
        </div>
    );
};

export default RichTextEditor;
