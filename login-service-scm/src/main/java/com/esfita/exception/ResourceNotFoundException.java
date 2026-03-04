package com.esfita.exception;

public class ResourceNotFoundException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = -6852397029875868390L;

	public ResourceNotFoundException(String message) {
        super(message);
    }
}
