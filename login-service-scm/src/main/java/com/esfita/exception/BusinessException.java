package com.esfita.exception;

public class BusinessException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 2565370705360003342L;

	public BusinessException(String message) {
        super(message);
    }
}
