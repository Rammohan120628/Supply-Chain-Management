package com.esfita.common;

public class ResponseDTO<T> {
	
	 
	    private boolean success;
	    private String message;
	    private T data;
	 
	    public ResponseDTO() {
	    }
	 
	    public ResponseDTO(boolean success, String message, T data) {
	        this.success = success;
	        this.message = message;
	        this.data = data;
	    }
	 
	    public static <T> Builder<T> builder() {
	        return new Builder<>();
	    }
	 
	    public static class Builder<T> {
	        private boolean success;
	        private String message;
	        private T data;
	 
	        public Builder<T> success(boolean success) {
	            this.success = success;
	            return this;
	        }
	 
	        public Builder<T> message(String message) {
	            this.message = message;
	            return this;
	        }
	 
	        public Builder<T> data(T data) {
	            this.data = data;
	            return this;
	        }
	 
	        public ResponseDTO<T> build() {
	            return new ResponseDTO<>(success, message, data);
	        }
	    }
	 
	    // Getters & Setters
	    public boolean isSuccess() {
	        return success;
	    }
	 
	    public void setSuccess(boolean success) {
	        this.success = success;
	    }
	 
	    public String getMessage() {
	        return message;
	    }
	 
	    public void setMessage(String message) {
	        this.message = message;
	    }
	 
	    public T getData() {
	        return data;
	    }
	 
	    public void setData(T data) {
	        this.data = data;
	    }
	
}
