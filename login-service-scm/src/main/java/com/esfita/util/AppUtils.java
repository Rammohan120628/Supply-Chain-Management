package com.esfita.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.text.DecimalFormat;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * @author DHURAIMURUGAN A
 * @since 01 JULY 2025
 * 
 */

public final class AppUtils {

//	 Encrypt And Decrypt
	private static final String ALGORITHM = "AES"; // Advanced Encryption Standard
	private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding"; // Cipher Block Chaining // padding
	private static final byte[] SECRET_KEY = "Eipl@Socat052024".getBytes(); // should be 16, 24, or 32 bytes
	private static final int IV_SIZE = 16; // should be 16 bytes for AES (128-bit block size)

	// Encrypt method
	public static String encrypt(String data) throws Exception {
		Cipher cipher = Cipher.getInstance(TRANSFORMATION);
		byte[] iv = new byte[IV_SIZE];
		new SecureRandom().nextBytes(iv); // Generate random IV
		cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(SECRET_KEY, ALGORITHM), new IvParameterSpec(iv));

		byte[] encryptedBytes = cipher.doFinal(data.getBytes());
		byte[] combined = new byte[IV_SIZE + encryptedBytes.length];
		System.arraycopy(iv, 0, combined, 0, IV_SIZE);
		System.arraycopy(encryptedBytes, 0, combined, IV_SIZE, encryptedBytes.length);

		return Base64.getEncoder().encodeToString(combined);
	}

	// Decrypt
	public static String decrypt(String encryptedData) throws Exception {
		Cipher cipher = Cipher.getInstance(TRANSFORMATION);
		byte[] decodedBytes = Base64.getDecoder().decode(encryptedData);

		byte[] iv = new byte[IV_SIZE];
		byte[] encryptedBytes = new byte[decodedBytes.length - IV_SIZE];
		System.arraycopy(decodedBytes, 0, iv, 0, IV_SIZE);
		System.arraycopy(decodedBytes, IV_SIZE, encryptedBytes, 0, encryptedBytes.length);

		cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(SECRET_KEY, ALGORITHM), new IvParameterSpec(iv));
		return new String(cipher.doFinal(encryptedBytes));
	}

//  Add
	public static double formatDouble(double value, int decimalPlaces) {
		BigDecimal bd = BigDecimal.valueOf(value);
		bd = bd.setScale(decimalPlaces, RoundingMode.HALF_UP);
		return bd.doubleValue();
	}

	public static String formatDoubleStr(double value, int decimalPlaces) {
		BigDecimal bd = BigDecimal.valueOf(value);
		bd = bd.setScale(decimalPlaces, RoundingMode.HALF_UP);

		String pattern;
		switch (decimalPlaces) {
		case 0:
			pattern = "#,###,##0";
			break;
		case 1:
			pattern = "#,###,##0.0";
			break;
		case 2:
			pattern = "#,###,##0.00";
			break;
		case 3:
			pattern = "#,###,##0.000";
			break;
		case 4:
			pattern = "#,###,##0.0000";
			break;
		default:
			pattern = "#,###,##0.#####"; // Default to max 5 decimal places
		}

		DecimalFormat df = new DecimalFormat(pattern);
		return df.format(bd.doubleValue());
	}

	public static String decimalFormat(int decimalPlaces) {

		String pattern;
		switch (decimalPlaces) {
		case 0:
			pattern = "#,###,##0";
			break;
		case 1:
			pattern = "#,###,##0.0";
			break;
		case 2:
			pattern = "#,###,##0.00";
			break;
		case 3:
			pattern = "#,###,##0.000";
			break;
		case 4:
			pattern = "#,###,##0.0000";
			break;
		default:
			pattern = "#,###,##0.#####"; // Default to max 5 decimal places
		}

		return pattern;
	}

}