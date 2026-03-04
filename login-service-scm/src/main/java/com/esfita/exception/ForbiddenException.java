package com.esfita.exception;

public class ForbiddenException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = -5944451624903400111L;

	public ForbiddenException(String message) {
        super(message);
    }
}
