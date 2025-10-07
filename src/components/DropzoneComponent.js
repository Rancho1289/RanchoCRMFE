import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

const DropzoneComponent = ({ files, setFiles }) => {
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const thumbs = files.map(file => (
    <div key={file.name} style={{ margin: '10px' }}>
      <img
        src={file.preview}
        alt={file.name}
        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
      />
    </div>
  ));

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <div>
      <div {...getRootProps({ className: 'dropzone' })} style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center' }}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>여기에 드롭하여 업로드</p>
        ) : (
          <p>이미지를 드래그 앤 드롭하거나 클릭하여 파일을 선택하세요</p>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
        {thumbs}
      </div>
    </div>
  );
};

export default DropzoneComponent;
