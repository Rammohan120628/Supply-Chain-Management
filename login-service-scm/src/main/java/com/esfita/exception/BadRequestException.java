package com.esfita.exception;

public class BadRequestException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 2807403407919037574L;

	public BadRequestException(String message) {
        super(message);
    }
}
