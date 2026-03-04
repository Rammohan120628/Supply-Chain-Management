/**
 * 
 * @author Rammohan R
 * @since 29-Nov-2025
 * 
 */
package com.esfita.service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.esfita.entity.EntityEiisHib;
import com.esfita.repository.EntityEiisRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Service
public class JsonFileStorageService {

	@Autowired
	EntityEiisRepository entityEiisRepository;

	private static final Logger log = LoggerFactory.getLogger(JsonFileStorageService.class);

	/**
	 * Saves object as JSON file to specified location
	 */
	public String saveJsonToFile(Object object, String filePrefix, String basePath) throws IOException {
		// Convert object to JSON string
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.enable(SerializationFeature.INDENT_OUTPUT);

		String jsonString = objectMapper.writeValueAsString(object);

		// Generate filename with timestamp
		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
		String fileName = filePrefix + "_" + timestamp + ".json";
		String filePath = basePath + fileName;

		// Create directory if it doesn't exist
		createDirectoryIfNotExists(basePath);

		// Write JSON to file
		Files.write(Paths.get(filePath), jsonString.getBytes(StandardCharsets.UTF_8));

		// Verify file was created
		verifyFileCreated(filePath);

		log.info("File saved successfully: {}", filePath);
		return filePath;
	}

	/**
	 * Creates directory if it doesn't exist
	 */
	private void createDirectoryIfNotExists(String directoryPath) throws IOException {
		File directory = new File(directoryPath);
		if (!directory.exists()) {
			boolean dirsCreated = directory.mkdirs();
			if (!dirsCreated) {
				throw new IOException("Failed to create directories: " + directoryPath);
			}
		}
	}

	/**
	 * Verifies that file was created successfully
	 */
	private void verifyFileCreated(String filePath) throws IOException {
		File savedFile = new File(filePath);
		if (!savedFile.exists()) {
			throw new IOException("File was not created: " + filePath);
		}
	}

	/**
	 * Overloaded method with default base path
	 */
	public String saveJsonToFile(Object object, String filePrefix) throws IOException {
		EntityEiisHib hib = entityEiisRepository.findByPk(1);

		String path = hib.getJsonPath();
		String master = "\\Tender Process Service\\";
		path = path + master;
		return saveJsonToFile(object, filePrefix, path);
	}
	
}