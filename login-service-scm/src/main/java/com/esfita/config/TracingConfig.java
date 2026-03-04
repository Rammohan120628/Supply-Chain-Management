package com.esfita.config;

import io.micrometer.tracing.Tracer;
import io.micrometer.tracing.otel.bridge.OtelTracer;
import io.micrometer.tracing.otel.bridge.OtelCurrentTraceContext;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributeKey;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TracingConfig {

	@Bean
	 Tracer micrometerTracer() {
		// OTLP exporter -> Jaeger/all-in-one OTLP receiver at 4317 (adjust if needed)
		OtlpGrpcSpanExporter exporter = OtlpGrpcSpanExporter.builder().setEndpoint("http://localhost:4317").build();

		// Create Attributes with service.name (no semconv dependency required)
		Attributes serviceAttrs = Attributes.of(AttributeKey.stringKey("service.name"), "login-service-scm");

		// Build resource containing the service name
		Resource resource = Resource.getDefault().merge(Resource.create(serviceAttrs));

		// Build SDK tracer provider with processor + resource
		SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
				.addSpanProcessor(BatchSpanProcessor.builder(exporter).build()).setResource(resource).build();

		// Create OpenTelemetry SDK
		OpenTelemetrySdk openTelemetry = OpenTelemetrySdk.builder().setTracerProvider(tracerProvider).build();

		// Return Micrometer Otel bridge tracer
		return new OtelTracer(openTelemetry.getTracer("login-service-scm"), new OtelCurrentTraceContext(),
				span -> {
				});
	}
}
