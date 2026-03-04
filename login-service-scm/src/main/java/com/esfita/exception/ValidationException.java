package com.esfita.exception;

public class ValidationException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = -5467234521844746333L;

	public ValidationException(String message) {
        super(message);
    }
}
