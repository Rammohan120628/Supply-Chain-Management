package com.esfita.dto;

import java.io.InputStream;

public  class FileResponseDTO {
    private final String fileName;
    private final InputStream inputStream;

    public FileResponseDTO(String fileName, InputStream inputStream) {
        this.fileName = fileName;
        this.inputStream = inputStream;
    }

    public String getFileName() {
        return fileName;
    }

    public InputStream getInputStream() {
        return inputStream;
    }
}
