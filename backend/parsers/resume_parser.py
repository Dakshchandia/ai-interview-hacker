import io
import os
from pathlib import Path

# PDF parsing
try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

# DOCX parsing
try:
    from docx import Document
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False


class ResumeParser:
    """
    Extracts plain text from uploaded resume files.
    Supports: PDF, DOCX, TXT
    
    Why plain text? Because Gemini (and all LLMs) work with text.
    We strip formatting and just get the content.
    """

    SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}

    def parse(self, file_bytes: bytes, filename: str) -> dict:
        """
        Main entry point. Takes raw file bytes and filename,
        returns a dict with extracted text and metadata.

        Args:
            file_bytes: Raw bytes of the uploaded file
            filename:   Original filename (used to detect type)

        Returns:
            {
                "text": "extracted resume text...",
                "filename": "resume.pdf",
                "file_type": ".pdf",
                "char_count": 1234,
                "success": True,
                "error": None
            }
        """
        ext = Path(filename).suffix.lower()

        if ext not in self.SUPPORTED_EXTENSIONS:
            return self._error_result(
                filename, ext,
                f"Unsupported file type '{ext}'. Allowed: {self.SUPPORTED_EXTENSIONS}"
            )

        try:
            if ext == ".pdf":
                text = self._parse_pdf(file_bytes)
            elif ext == ".docx":
                text = self._parse_docx(file_bytes)
            elif ext == ".txt":
                text = self._parse_txt(file_bytes)
            else:
                text = ""

            text = self._clean_text(text)

            if not text.strip():
                return self._error_result(
                    filename, ext,
                    "Could not extract any text. The file may be image-based or corrupted."
                )

            return {
                "text": text,
                "filename": filename,
                "file_type": ext,
                "char_count": len(text),
                "word_count": len(text.split()),
                "success": True,
                "error": None
            }

        except Exception as e:
            return self._error_result(filename, ext, str(e))

    # ------------------------------------------------------------------
    # Private parsers
    # ------------------------------------------------------------------

    def _parse_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF using PyPDF2."""
        if not PDF_SUPPORT:
            raise ImportError("PyPDF2 is not installed. Run: pip install PyPDF2")

        text_parts = []
        pdf_file = io.BytesIO(file_bytes)
        reader = PyPDF2.PdfReader(pdf_file)

        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

        return "\n".join(text_parts)

    def _parse_docx(self, file_bytes: bytes) -> str:
        """Extract text from DOCX using python-docx."""
        if not DOCX_SUPPORT:
            raise ImportError("python-docx is not installed. Run: pip install python-docx")

        docx_file = io.BytesIO(file_bytes)
        doc = Document(docx_file)

        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(paragraphs)

    def _parse_txt(self, file_bytes: bytes) -> str:
        """Decode plain text file."""
        # Try UTF-8 first, fall back to latin-1 (handles most encodings)
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1")

    def _clean_text(self, text: str) -> str:
        """
        Light cleanup — remove excessive whitespace while
        preserving structure (newlines between sections).
        """
        lines = text.splitlines()
        cleaned = []
        for line in lines:
            stripped = line.strip()
            if stripped:
                cleaned.append(stripped)

        return "\n".join(cleaned)

    def _error_result(self, filename: str, ext: str, error_msg: str) -> dict:
        return {
            "text": "",
            "filename": filename,
            "file_type": ext,
            "char_count": 0,
            "word_count": 0,
            "success": False,
            "error": error_msg
        }


# Singleton — import and use this everywhere
resume_parser = ResumeParser()
