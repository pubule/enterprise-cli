# Enterprise Framework Guide v2.0

> Advanced enterprise-grade framework for production-ready microservices

## Table of Contents

- [What's New in v2.0](#whats-new-in-v20)
- [Architecture Overview](#architecture-overview)
- [Core Packages](#core-packages)
  - [Exception Package](#exception-package)
  - [Validation Package](#validation-package)
  - [Event Package](#event-package)
  - [DTO Package](#dto-package)
  - [Core Entity Package](#core-entity-package)
  - [Core Repository Package](#core-repository-package)
  - [Core Service Package](#core-service-package)
  - [Core Controller Package](#core-controller-package)
- [Advanced Features](#advanced-features)
- [Migration from v1.0](#migration-from-v10)
- [Best Practices](#best-practices)

---

## What's New in v2.0

### 🚀 Major Enhancements

✅ **Field-Level Validation Errors**
- Structured error responses with field-specific messages
- Error codes for client-side handling
- Warnings in addition to errors

✅ **Business Rule Priority System**
- Rules execute in priority order
- Severity levels (INFO, WARNING, ERROR, CRITICAL)
- Conditional rule application

✅ **Advanced Event System**
- Typed domain events with payloads
- Event metadata support
- Async event publishing
- UUID-based event tracking

✅ **Rich Error Handling**
- ErrorDetails with field errors
- Business exception details map
- Consistent error response structure

✅ **Enhanced DTOs**
- ApiResponse with metadata
- PagedResponse with comprehensive pagination info
- EntityMapper with default methods

---

## Architecture Overview

The Enterprise Framework v2.0 consists of **8 integrated packages**:

```
┌─────────────────────────────────────────────────────────────┐
│                   Enterprise Framework v2.0                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 Exception Package     → Error handling & responses      │
│  📦 Validation Package    → Business validation & rules     │
│  📦 Event Package         → Domain events & publishing      │
│  📦 DTO Package           → Data transfer & mapping         │
│  📦 Core Entity Package   → JPA entities with audit         │
│  📦 Core Repository       → Data access layer               │
│  📦 Core Service          → Business logic layer            │
│  📦 Core Controller       → REST API layer                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Total Files**: 27 classes and interfaces
**Lines of Code**: ~3,500
**Boilerplate Reduction**: 70%

---

## Exception Package

### 1. ErrorDetails

Structured error information with field-level details.

```java
public class ErrorDetails {
    private String code;
    private String message;
    private List<FieldError> fieldErrors;

    public void addFieldError(String field, String message, String code)

    public static class FieldError {
        private String field;
        private String message;
        private String code;
    }
}
```

**Example:**
```java
ErrorDetails error = new ErrorDetails("VALIDATION_ERROR", "Validation failed");
error.addFieldError("email", "Email already exists", "DUPLICATE");
error.addFieldError("age", "Must be 18 or older", "MIN_VALUE");
```

### 2. BusinessException

Base exception with error code and details map.

```java
public class BusinessException extends RuntimeException {
    private final String errorCode;
    private final Map<String, Object> details;

    public BusinessException withDetail(String key, Object value)
    public BusinessException withDetails(Map<String, Object> details)
}
```

**Example:**
```java
throw new BusinessException("INSUFFICIENT_BALANCE", "Insufficient account balance")
    .withDetail("accountId", account.getId())
    .withDetail("requiredAmount", 500.00)
    .withDetail("currentBalance", account.getBalance());
```

### 3. ValidationException

Validation errors with field-level details.

```java
public class ValidationException extends BusinessException {
    private final List<ValidationResult.ValidationError> validationErrors;

    public static ValidationException fromValidationResult(ValidationResult result)
    public List<String> getErrors() // Backward compatible
}
```

**Example:**
```java
ValidationResult result = new ValidationResult();
result.addError("email", "Invalid email format", "INVALID_FORMAT");
result.addError("phone", "Phone number required", "REQUIRED");

throw ValidationException.fromValidationResult(result);
```

### 4. ResourceNotFoundException

HTTP 404 exception with details.

```java
public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(String resourceType, Object id)
}
```

**Example:**
```java
throw new ResourceNotFoundException("Customer", customerId)
    .withDetail("searchedBy", "email")
    .withDetail("email", searchEmail);
```

### 5. GlobalExceptionHandler

Centralized exception handling with field-level error mapping.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(ValidationException ex) {
        ErrorDetails errorDetails = new ErrorDetails(ex.getErrorCode(), ex.getMessage());

        for (ValidationResult.ValidationError error : ex.getValidationErrors()) {
            errorDetails.addFieldError(error.getField(), error.getMessage(), error.getCode());
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(errorDetails));
    }
}
```

**Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fieldErrors": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "INVALID_FORMAT"
      }
    ]
  },
  "metadata": {
    "timestamp": "2025-10-02T10:30:00"
  }
}
```

---

## Validation Package

### 1. ValidationResult

Validation result with errors and warnings.

```java
public class ValidationResult {
    private List<ValidationError> errors;
    private List<ValidationWarning> warnings;

    public void addError(String field, String message, String code)
    public void addWarning(String field, String message)
    public boolean isValid()
    public boolean hasWarnings()

    public static class ValidationError {
        private String field;
        private String message;
        private String code;
    }

    public static class ValidationWarning {
        private String field;
        private String message;
    }
}
```

**Example:**
```java
ValidationResult result = new ValidationResult();
result.addError("email", "Required field", "REQUIRED");
result.addWarning("phone", "Format unusual but valid");

if (!result.isValid()) {
    throw ValidationException.fromValidationResult(result);
}

if (result.hasWarnings()) {
    log.warn("Validation warnings: {}", result.getWarnings());
}
```

### 2. ValidationContext

Context for validation operations with additional data.

```java
public class ValidationContext {
    public enum OperationType { CREATE, UPDATE, DELETE }

    private final OperationType operationType;
    private final Map<String, Object> additionalContext;

    public ValidationContext with(String key, Object value)
    public <T> T get(String key, Class<T> type)
}
```

**Example:**
```java
ValidationContext context = ValidationContext.forUpdate(existingCustomer)
    .with("userId", currentUser.getId())
    .with("ipAddress", request.getRemoteAddr());

validator.validate(customer, context);
```

### 3. RuleResult

Business rule evaluation result with severity.

```java
public class RuleResult {
    public enum RuleSeverity { INFO, WARNING, ERROR, CRITICAL }

    public static RuleResult pass(String ruleName)
    public static RuleResult fail(String ruleName, String message, RuleSeverity severity)
    public static RuleResult warning(String ruleName, String message)
    public static RuleResult critical(String ruleName, String message)
}
```

**Example:**
```java
if (order.getTotal() > customer.getCreditLimit()) {
    return RuleResult.critical("CreditLimitRule",
        "Order exceeds customer credit limit");
}

if (order.getTotal() > 5000) {
    return RuleResult.warning("HighValueOrderRule",
        "Order requires manager approval");
}

return RuleResult.pass("CreditLimitRule");
```

### 4. BusinessRule

Business rule interface with priority support.

```java
public interface BusinessRule<T> {
    String getRuleName();
    RuleResult evaluate(T entity, RuleContext context);
    int getPriority(); // Lower = higher priority (default 100)
    boolean applies(T entity, RuleContext context);
}
```

**Example:**
```java
@Component
public class CustomerCreditCheckRule implements BusinessRule<Order> {

    @Override
    public String getRuleName() {
        return "CustomerCreditCheck";
    }

    @Override
    public int getPriority() {
        return 10; // Execute early
    }

    @Override
    public RuleResult evaluate(Order order, RuleContext context) {
        Customer customer = context.get("customer", Customer.class);

        if (order.getTotal() > customer.getCreditLimit()) {
            return RuleResult.fail(getRuleName(),
                "Order exceeds credit limit", RuleSeverity.ERROR);
        }

        return RuleResult.pass(getRuleName());
    }

    @Override
    public boolean applies(Order order, RuleContext context) {
        return context.isCreate() && order.getPaymentMethod() == PaymentMethod.CREDIT;
    }
}
```

### 5. BusinessValidator

Validator interface for entities.

```java
public interface BusinessValidator<T> {
    ValidationResult validate(T entity, ValidationContext context);
}
```

**Example:**
```java
@Component
public class CustomerValidator implements BusinessValidator<Customer> {

    @Override
    public ValidationResult validate(Customer customer, ValidationContext context) {
        ValidationResult result = new ValidationResult();

        if (customer.getEmail() == null || customer.getEmail().isBlank()) {
            result.addError("email", "Email is required", "REQUIRED");
        } else if (!isValidEmail(customer.getEmail())) {
            result.addError("email", "Invalid email format", "INVALID_FORMAT");
        }

        if (customer.getAge() != null && customer.getAge() < 18) {
            result.addError("age", "Must be 18 or older", "MIN_AGE");
        }

        if (context.isUpdate()) {
            Customer existing = (Customer) context.getExistingEntity();
            if (!existing.getEmail().equals(customer.getEmail())) {
                result.addWarning("email", "Email change requires verification");
            }
        }

        return result;
    }
}
```

---

## Event Package

### 1. DomainEvent<T>

Base interface for typed domain events.

```java
public interface DomainEvent<T> {
    String getEventId();
    String getEventType();
    T getPayload();
    LocalDateTime getOccurredAt();
    String getSource();
    Map<String, Object> getMetadata();
}
```

### 2. AbstractDomainEvent<T>

Base implementation with UUID and metadata.

```java
public abstract class AbstractDomainEvent<T> implements DomainEvent<T> {
    private final String eventId = UUID.randomUUID().toString();
    private final String eventType;
    private final T payload;
    private final LocalDateTime occurredAt = LocalDateTime.now();
    private final String source;
    private final Map<String, Object> metadata = new HashMap<>();

    public void addMetadata(String key, Object value)
}
```

### 3. Entity Events

Pre-built events for CRUD operations.

```java
public class EntityCreatedEvent<T> extends AbstractDomainEvent<T>
public class EntityUpdatedEvent<T> extends AbstractDomainEvent<T>
public class EntityDeletedEvent<T> extends AbstractDomainEvent<T>
public class EntitySoftDeletedEvent<T> extends AbstractDomainEvent<T>
```

**Example:**
```java
// Automatic event in AbstractEnterpriseService
EntityCreatedEvent<Customer> event = new EntityCreatedEvent<>(customer);
event.addMetadata("userId", currentUser.getId());
event.addMetadata("source", "API");
eventPublisher.publish(event);
```

### 4. EventPublisher

Interface for synchronous and asynchronous publishing.

```java
public interface EventPublisher {
    <T> void publish(DomainEvent<T> event);
    <T> void publishAsync(DomainEvent<T> event);
}
```

### 5. SpringEventPublisher

Spring-based implementation with @Async support.

```java
@Component
public class SpringEventPublisher implements EventPublisher {

    @Override
    public <T> void publish(DomainEvent<T> event) {
        applicationEventPublisher.publishEvent(event);
    }

    @Override
    @Async
    public <T> void publishAsync(DomainEvent<T> event) {
        applicationEventPublisher.publishEvent(event);
    }
}
```

**Configuration Required:**
```java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.initialize();
        return executor;
    }
}
```

**Event Listener Example:**
```java
@Component
public class CustomerEventListener {

    @EventListener
    public void handleCustomerCreated(EntityCreatedEvent<Customer> event) {
        Customer customer = event.getPayload();
        String userId = (String) event.getMetadata().get("userId");

        log.info("Customer {} created by user {}", customer.getId(), userId);
        emailService.sendWelcomeEmail(customer);
    }

    @Async
    @EventListener
    public void handleCustomerCreatedAsync(EntityCreatedEvent<Customer> event) {
        // Runs asynchronously
        analyticsService.trackCustomerCreation(event.getPayload());
    }
}
```

---

## DTO Package

### 1. ApiResponse<T>

Standard API response with metadata and error details.

```java
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private ErrorDetails error;
    private Map<String, Object> metadata;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data)
    public static <T> ApiResponse<T> error(String message, String code)
    public static <T> ApiResponse<T> error(ErrorDetails errorDetails)
    public ApiResponse<T> withMetadata(String key, Object value)
}
```

**Success Response:**
```java
return ApiResponse.success(customer)
    .withMetadata("executionTime", "125ms")
    .withMetadata("cacheHit", true);
```

**Error Response:**
```java
ErrorDetails error = new ErrorDetails("VALIDATION_ERROR", "Invalid input");
error.addFieldError("email", "Email already exists", "DUPLICATE");

return ApiResponse.error(error);
```

**JSON Output:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "John" },
  "metadata": {
    "executionTime": "125ms",
    "cacheHit": true
  },
  "timestamp": "2025-10-02T10:30:00"
}
```

### 2. PagedResponse<T>

Pagination wrapper with comprehensive metadata.

```java
public class PagedResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
    private boolean first;
    private boolean empty;

    public static <T> PagedResponse<T> from(Page<T> page)
}
```

**Example:**
```java
Page<Customer> page = customerRepository.findAll(pageable);
PagedResponse<CustomerResponse> response = PagedResponse.from(
    page.map(mapper::toResponse)
);
```

### 3. EntityMapper<ENTITY, REQUEST, RESPONSE>

Mapping interface with default methods.

```java
public interface EntityMapper<ENTITY, REQUEST, RESPONSE> {
    ENTITY toEntity(REQUEST request);
    RESPONSE toResponse(ENTITY entity);

    default List<RESPONSE> toResponseList(List<ENTITY> entities) {
        return entities.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    void updateEntity(ENTITY entity, REQUEST request);
}
```

**Example:**
```java
@Component
public class CustomerMapper implements EntityMapper<Customer, CustomerRequest, CustomerResponse> {

    @Override
    public Customer toEntity(CustomerRequest request) {
        Customer customer = new Customer();
        customer.setEmail(request.email());
        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        return customer;
    }

    @Override
    public CustomerResponse toResponse(Customer entity) {
        return new CustomerResponse(
            entity.getId(),
            entity.getEmail(),
            entity.getFirstName() + " " + entity.getLastName(),
            entity.getStatus()
        );
    }

    @Override
    public void updateEntity(Customer entity, CustomerRequest request) {
        entity.setEmail(request.email());
        entity.setFirstName(request.firstName());
        entity.setLastName(request.lastName());
    }
}
```

---

## Core Entity Package

### 1. AbstractAuditableEntity<ID>

Base entity with generic ID, audit fields, and versioning.

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AbstractAuditableEntity<ID> implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private ID id;

    @CreatedBy
    @Column(name = "created_by", nullable = false, updatable = false)
    private String createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedBy
    @Column(name = "updated_by", nullable = false)
    private String updatedBy;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}
```

**Your Entity:**
```java
@Entity
@Table(name = "customers")
public class Customer extends AbstractAuditableEntity<Long>
        implements SoftDeletable, TenantAware {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String firstName;

    private String tenantId;
    private boolean deleted = false;
    private LocalDateTime deletedAt;
    private String deletedBy;

    // Only YOUR business fields!
}
```

### 2. SoftDeletable

Interface for soft delete support.

```java
public interface SoftDeletable {
    boolean isDeleted();
    void setDeleted(boolean deleted);
    LocalDateTime getDeletedAt();
    void setDeletedAt(LocalDateTime deletedAt);
    String getDeletedBy();
    void setDeletedBy(String deletedBy);

    default void softDelete() {
        setDeleted(true);
        setDeletedAt(LocalDateTime.now());
        // setDeletedBy from security context
    }
}
```

### 3. TenantAware

Interface for multi-tenancy.

```java
public interface TenantAware {
    String getTenantId();
    void setTenantId(String tenantId);
}
```

---

## Core Service Package

### AbstractEnterpriseService<T, ID>

Service base with validation, events, and transactions.

```java
@Transactional
public abstract class AbstractEnterpriseService<T extends AbstractAuditableEntity<ID>, ID>
        implements CrudService<T, ID> {

    protected final AbstractEnterpriseRepository<T, ID> repository;
    protected final BusinessValidator<T> validator;
    protected final ApplicationEventPublisher eventPublisher;

    public T create(T entity) {
        // Validate
        ValidationResult result = validator.validate(entity, ValidationContext.forCreate());
        if (!result.isValid()) {
            throw ValidationException.fromValidationResult(result);
        }

        // Business rules
        executeBusinessRules(entity, RuleContext.forCreate());

        // Save and publish event
        T saved = repository.save(entity);
        publishEvent(new EntityCreatedEvent<>(saved));
        return saved;
    }

    protected abstract void mergeForUpdate(T existing, T updates);
    protected void executeBusinessRules(T entity, RuleContext context) {}
}
```

**Your Service:**
```java
@Service
public class CustomerService extends AbstractEnterpriseService<Customer, Long> {

    public CustomerService(
        CustomerRepository repository,
        CustomerValidator validator,
        ApplicationEventPublisher eventPublisher
    ) {
        super(repository, validator, eventPublisher);
    }

    @Override
    protected void mergeForUpdate(Customer existing, Customer updates) {
        existing.setEmail(updates.getEmail());
        existing.setFirstName(updates.getFirstName());
        existing.setLastName(updates.getLastName());
    }

    @Override
    protected void executeBusinessRules(Customer customer, RuleContext context) {
        List<BusinessRule<Customer>> rules = List.of(
            new CustomerCreditCheckRule(),
            new CustomerAgeVerificationRule()
        );

        rules.stream()
            .sorted(Comparator.comparingInt(BusinessRule::getPriority))
            .filter(rule -> rule.applies(customer, context))
            .forEach(rule -> {
                RuleResult result = rule.evaluate(customer, context);
                if (result.isFailed()) {
                    throw new BusinessException(
                        result.getRuleName(),
                        result.getMessage()
                    );
                }
            });
    }
}
```

---

## Core Controller Package

### AbstractEnterpriseController<T, ID, REQ, RES>

Controller base with standard REST endpoints.

```java
public abstract class AbstractEnterpriseController<
        T extends AbstractAuditableEntity<ID>, ID, REQ, RES> {

    protected final AbstractEnterpriseService<T, ID> service;
    protected final EntityMapper<T, REQ, RES> mapper;

    @PostMapping
    public ResponseEntity<ApiResponse<RES>> create(@Valid @RequestBody REQ request) {
        T entity = mapper.toEntity(request);
        T created = service.create(entity);
        RES response = mapper.toResponse(created);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response, "Entity created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<RES>>> findAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "id") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
            ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<T> entityPage = service.findAll(pageable);
        Page<RES> responsePage = entityPage.map(mapper::toResponse);

        return ResponseEntity.ok(
            ApiResponse.success(PagedResponse.from(responsePage))
        );
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<RES>>> search(
        @RequestParam Map<String, String> criteria,
        Pageable pageable
    ) {
        Specification<T> spec = buildSpecification(criteria);
        Page<T> page = service.findWithCriteria(spec, pageable);

        return ResponseEntity.ok(
            ApiResponse.success(PagedResponse.from(page.map(mapper::toResponse)))
        );
    }

    protected abstract Specification<T> buildSpecification(Map<String, String> criteria);
}
```

**Your Controller:**
```java
@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController extends AbstractEnterpriseController<
        Customer, Long, CustomerRequest, CustomerResponse> {

    public CustomerController(
        CustomerService service,
        CustomerMapper mapper
    ) {
        super(service, mapper);
    }

    @Override
    protected Specification<Customer> buildSpecification(Map<String, String> criteria) {
        SpecificationBuilder<Customer> builder = new SpecificationBuilder<>();

        if (criteria.containsKey("email")) {
            builder.withEqual("email", criteria.get("email"));
        }
        if (criteria.containsKey("status")) {
            builder.withEqual("status", criteria.get("status"));
        }
        if (criteria.containsKey("name")) {
            builder.withLike("firstName", criteria.get("name"))
                  .or()
                  .withLike("lastName", criteria.get("name"));
        }

        return builder.build();
    }
}
```

---

## Advanced Features

### 1. Field-Level Validation Errors

```java
// Client receives detailed field errors
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fieldErrors": [
      {
        "field": "email",
        "message": "Email already exists",
        "code": "DUPLICATE"
      },
      {
        "field": "age",
        "message": "Must be 18 or older",
        "code": "MIN_AGE"
      }
    ]
  }
}
```

### 2. Validation Warnings

```java
ValidationResult result = validator.validate(customer, context);

if (!result.isValid()) {
    throw ValidationException.fromValidationResult(result);
}

if (result.hasWarnings()) {
    log.warn("Validation warnings: {}", result.getWarnings());
    // Optionally include warnings in response metadata
    response.withMetadata("warnings", result.getWarnings());
}
```

### 3. Business Rule Priority

```java
// High priority rules execute first
class CreditLimitRule implements BusinessRule<Order> {
    @Override
    public int getPriority() { return 10; } // Execute first
}

class InventoryCheckRule implements BusinessRule<Order> {
    @Override
    public int getPriority() { return 50; }
}

class DiscountRule implements BusinessRule<Order> {
    @Override
    public int getPriority() { return 100; } // Execute last
}
```

### 4. Event Metadata

```java
EntityCreatedEvent<Order> event = new EntityCreatedEvent<>(order);
event.addMetadata("userId", currentUser.getId());
event.addMetadata("channel", "WEB");
event.addMetadata("campaign", campaignId);
event.addMetadata("ipAddress", request.getRemoteAddr());

eventPublisher.publish(event);

// In listener
@EventListener
public void handleOrderCreated(EntityCreatedEvent<Order> event) {
    String channel = (String) event.getMetadata().get("channel");
    if ("WEB".equals(channel)) {
        // Special handling for web orders
    }
}
```

### 5. Async Event Publishing

```java
// Synchronous - blocks until listeners complete
eventPublisher.publish(event);

// Asynchronous - returns immediately
eventPublisher.publishAsync(event);
```

### 6. Response Metadata

```java
return ApiResponse.success(customer)
    .withMetadata("executionTime", stopwatch.elapsed())
    .withMetadata("cacheHit", fromCache)
    .withMetadata("apiVersion", "2.0")
    .withMetadata("warnings", validationWarnings);
```

---

## Migration from v1.0

### Breaking Changes

#### 1. PageResponse → PagedResponse

```java
// OLD
import ...dto.PageResponse;
pageResponse.getCurrentPage()

// NEW
import ...dto.PagedResponse;
pagedResponse.getPageNumber()
```

#### 2. ValidationException API

```java
// OLD
throw new ValidationException(List.of("error1", "error2"));

// NEW
ValidationResult result = new ValidationResult();
result.addError("field", "message", "CODE");
throw ValidationException.fromValidationResult(result);
```

#### 3. ApiResponse Structure

```json
// OLD
{
  "success": false,
  "message": "Error message"
}

// NEW
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "fieldErrors": []
  }
}
```

#### 4. BusinessRule Interface

```java
// OLD
public interface BusinessRule<T> {
    void execute(T entity, RuleContext context);
}

// NEW
public interface BusinessRule<T> {
    String getRuleName();
    RuleResult evaluate(T entity, RuleContext context);
    int getPriority();
}
```

#### 5. DomainEvent Generic Type

```java
// OLD
public class EntityCreatedEvent implements DomainEvent

// NEW
public class EntityCreatedEvent<T> extends AbstractDomainEvent<T>
```

---

## Best Practices

### 1. Use Field-Level Errors

✅ **Do:**
```java
result.addError("email", "Email already exists", "DUPLICATE");
result.addError("age", "Must be 18+", "MIN_AGE");
```

❌ **Don't:**
```java
throw new RuntimeException("Email already exists and age must be 18+");
```

### 2. Leverage Validation Warnings

```java
if (customer.getPhoneFormat().isUnusual()) {
    result.addWarning("phone", "Phone format is unusual but valid");
}
```

### 3. Use Business Rule Priorities

```java
// Security checks first (priority 10)
// Data validation next (priority 50)
// Business logic last (priority 100)
```

### 4. Add Event Metadata

```java
event.addMetadata("correlationId", requestId);
event.addMetadata("userId", currentUser.getId());
event.addMetadata("source", "API");
```

### 5. Use Async Events for Non-Critical Tasks

```java
// Critical (synchronous)
eventPublisher.publish(new PaymentProcessedEvent(payment));

// Non-critical (asynchronous)
eventPublisher.publishAsync(new AnalyticsEvent(data));
```

### 6. Enrich Responses with Metadata

```java
return ApiResponse.success(data)
    .withMetadata("executionTime", executionTime)
    .withMetadata("cacheStatus", cacheHit ? "HIT" : "MISS")
    .withMetadata("warnings", warnings);
```

---

## Summary

The Enterprise Framework v2.0 provides a complete, production-ready foundation:

✅ **Exception Package** - Structured errors with field-level details
✅ **Validation Package** - Business rules with priorities and warnings
✅ **Event Package** - Typed domain events with metadata
✅ **DTO Package** - Standardized responses with rich metadata
✅ **Core Entities** - Audit, soft delete, multi-tenancy
✅ **Core Services** - Validation, transactions, events
✅ **Core Controllers** - REST endpoints with pagination

**Your job:** Focus on business logic, not infrastructure.

---

## Next Steps

- [Getting Started Tutorial](./TUTORIAL_GETTING_STARTED.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [CLI Commands Reference](./README.md)
