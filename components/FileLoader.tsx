
import React, { useRef, useCallback } from 'react';
import { FileUploadIcon } from './icons/FileUploadIcon';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

interface FileLoaderProps {
  onFileLoad: (content: string) => void;
  disabled: boolean;
  onError: (message: string) => void;
}

const parsePptx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const parser = new DOMParser();

  const presentationXml = await zip.file('ppt/presentation.xml')?.async('string');
  if (!presentationXml) throw new Error('ppt/presentation.xml not found.');

  const presentationDoc = parser.parseFromString(presentationXml, 'application/xml');
  const slideIdNodes = Array.from(presentationDoc.getElementsByTagName('p:sldId'));
  
  const relsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string');
  if (!relsXml) throw new Error('ppt/_rels/presentation.xml.rels not found.');
  
  const relsDoc = parser.parseFromString(relsXml, 'application/xml');
  const rels = new Map(
      Array.from(relsDoc.getElementsByTagName('Relationship')).map(r => [
          r.getAttribute('Id') || '',
          r.getAttribute('Target') || ''
      ])
  );

  const slidePromises = slideIdNodes.map(node => {
      const rId = node.getAttribute('r:id');
      if (!rId) return Promise.resolve('');
      const slidePath = rels.get(rId);
      if (!slidePath) return Promise.resolve('');
      
      const slideFile = zip.file(`ppt/${slidePath}`);
      if (!slideFile) return Promise.resolve('');

      return slideFile.async('string').then(xmlString => {
          const slideDoc = parser.parseFromString(xmlString, 'application/xml');
          const textNodes = slideDoc.getElementsByTagName('a:t');
          return Array.from(textNodes).map(t => t.textContent).join(' ');
      });
  });

  const slideTexts = await Promise.all(slidePromises);
  return slideTexts
      .map((text, i) => `--- スライド ${i + 1} ---\n\n${text.trim()}\n\n`)
      .join('');
};


const FileLoader: React.FC<FileLoaderProps> = ({ onFileLoad, disabled, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    
    // Reset input value to allow re-uploading the same file
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const reader = new FileReader();

    reader.onerror = () => {
      onError('ファイルの読み込み中にエラーが発生しました。');
    };

    switch (extension) {
      case 'pdf':
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@^4.4.179/build/pdf.worker.mjs';

            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
              if (pageText.trim()) {
                fullText += `--- ページ ${i} ---\n\n${pageText.trim()}\n\n`;
              }
            }
            onFileLoad(fullText);
          } catch (err) {
            console.error('Error parsing .pdf file:', err);
            onError('PDFファイルの解析に失敗しました。');
          }
        };
        reader.readAsArrayBuffer(file);
        break;

      case 'docx':
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            onFileLoad(result.value);
          } catch (err) {
            console.error('Error parsing .docx file:', err);
            onError('Wordファイルの解析に失敗しました。');
          }
        };
        reader.readAsArrayBuffer(file);
        break;

      case 'xlsx':
        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            let fullText = '';
            workbook.SheetNames.forEach(sheetName => {
              const worksheet = workbook.Sheets[sheetName];
              const sheetText = XLSX.utils.sheet_to_txt(worksheet, {
                blankrows: false,
              });
              if (sheetText.trim()) {
                fullText += `--- シート: ${sheetName} ---\n\n${sheetText}\n\n`;
              }
            });
            onFileLoad(fullText);
          } catch (err) {
            console.error('Error parsing .xlsx file:', err);
            onError('Excelファイルの解析に失敗しました。');
          }
        };
        reader.readAsArrayBuffer(file);
        break;
      
      case 'pptx':
        reader.onload = async (e) => {
            try {
              const arrayBuffer = e.target?.result as ArrayBuffer;
              const text = await parsePptx(arrayBuffer);
              onFileLoad(text);
            } catch (err) {
              console.error('Error parsing .pptx file:', err);
              onError('PowerPointファイルの解析に失敗しました。');
            }
        };
        reader.readAsArrayBuffer(file);
        break;

      default: // Plain text files
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === 'string') {
            onFileLoad(text);
          } else {
            onError('ファイルの読み込みに失敗しました。テキスト形式のファイルを選択してください。');
          }
        };
        reader.readAsText(file);
        break;
    }
  }, [onFileLoad, onError]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.html,.csv,.json,text/*,.docx,.xlsx,.pptx,.pdf"
        disabled={disabled}
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="ファイルを読み込む"
      >
        <FileUploadIcon className="w-4 h-4" />
        ファイルを読み込む
      </button>
    </>
  );
};

export default FileLoader;