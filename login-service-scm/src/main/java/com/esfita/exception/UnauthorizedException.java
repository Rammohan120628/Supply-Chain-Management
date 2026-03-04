package com.esfita.exception;

public class UnauthorizedException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 8311997995882220622L;

	public UnauthorizedException(String message) {
        super(message);
    }
}
