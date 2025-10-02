# Enterprise Framework v{{frameworkVersion}}

> **Production-ready Spring Boot framework with advanced validation, events, DTOs, and business rules**

## Quick Start

The Enterprise Framework provides base classes and utilities to build robust Spring Boot applications with 70% less boilerplate.

### 1. Entity Example

```java
@EnterpriseEntity(auditable = true, softDeletable = true)
@Entity
@Table(name = "products")
public class Product extends AbstractAuditableEntity<Long> implements SoftDeletable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(length = 100)
    private String category;

    // Soft delete support
    @Column(nullable = false)
    private boolean deleted = false;

    @Column
    private LocalDateTime deletedAt;

    @Column
    private String deletedBy;

    // Getters and Setters

    @Override
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @Override
    public boolean isDeleted() {
        return deleted;
    }

    @Override
    public void softDelete() {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
        // deletedBy will be set by audit
    }

    @Override
    public void restore() {
        this.deleted = false;
        this.deletedAt = null;
        this.deletedBy = null;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public String getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(String deletedBy) {
        this.deletedBy = deletedBy;
    }
}
```

### 2. Repository Example

```java
@Repository
public interface ProductRepository extends AbstractEnterpriseRepository<Product, Long> {

    // Custom query methods

    List<Product> findByCategory(String category);

    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    @Query("SELECT p FROM Product p WHERE p.stockQuantity < :threshold AND p.deleted = false")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold);

    // Uses built-in methods from AbstractEnterpriseRepository:
    // - findAll(Pageable)
    // - findWithCriteria(Specification, Pageable)
    // - findByIdAndDeletedFalse(ID)
    // - findAllByDeletedFalse(Pageable)
}
```

### 3. Service Example

```java
@EnterpriseService
public class ProductService extends AbstractEnterpriseService<Product, Long> {

    private final ProductRepository productRepository;

    public ProductService(
            ProductRepository productRepository,
            BusinessValidator<Product> validator,
            ApplicationEventPublisher eventPublisher) {
        super(productRepository, validator, eventPublisher);
        this.productRepository = productRepository;
    }

    @Override
    protected void mergeForUpdate(Product existing, Product updates) {
        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setPrice(updates.getPrice());
        existing.setStockQuantity(updates.getStockQuantity());
        existing.setCategory(updates.getCategory());
    }

    @Override
    protected String getEntityName() {
        return "Product";
    }

    // Custom business methods

    public List<Product> findLowStockProducts(Integer threshold) {
        log.debug("Finding products with stock below {}", threshold);
        return productRepository.findLowStockProducts(threshold);
    }

    public Product adjustStock(Long productId, Integer adjustment) {
        log.debug("Adjusting stock for product {} by {}", productId, adjustment);

        Product product = findById(productId);
        Integer currentStock = product.getStockQuantity();
        Integer newStock = currentStock + adjustment;

        if (newStock < 0) {
            throw new BusinessException("INSUFFICIENT_STOCK")
                    .withMessage("Cannot reduce stock below zero")
                    .withDetail("currentStock", currentStock)
                    .withDetail("adjustment", adjustment);
        }

        product.setStockQuantity(newStock);
        Product updated = productRepository.save(product);

        // Publish custom event
        publishEvent(new ProductStockAdjustedEvent(updated, adjustment));

        return updated;
    }
}
```

### 4. Controller Example

```java
@EnterpriseController("/api/v1/products")
public class ProductController extends AbstractEnterpriseController<
        Product, Long, ProductRequest, ProductResponse> {

    private final ProductService productService;

    public ProductController(
            ProductService productService,
            ProductMapper mapper) {
        super(productService, mapper);
        this.productService = productService;
    }

    @Override
    protected Specification<Product> buildSpecification(Map<String, String> criteria) {
        SpecificationBuilder<Product> builder = new SpecificationBuilder<>();

        if (criteria.containsKey("name")) {
            builder.withLike("name", criteria.get("name"));
        }
        if (criteria.containsKey("category")) {
            builder.withEqual("category", criteria.get("category"));
        }
        if (criteria.containsKey("minPrice")) {
            builder.withGreaterThanOrEqual("price", new BigDecimal(criteria.get("minPrice")));
        }
        if (criteria.containsKey("maxPrice")) {
            builder.withLessThanOrEqual("price", new BigDecimal(criteria.get("maxPrice")));
        }

        return builder.build();
    }

    @Override
    protected String getEntityName() {
        return "Product";
    }

    // Custom endpoints

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStockProducts(
            @RequestParam(defaultValue = "10") Integer threshold) {

        log.debug("Getting low stock products with threshold: {}", threshold);

        List<Product> products = productService.findLowStockProducts(threshold);
        List<ProductResponse> responses = products.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/{id}/adjust-stock")
    public ResponseEntity<ApiResponse<ProductResponse>> adjustStock(
            @PathVariable Long id,
            @RequestParam Integer adjustment) {

        log.debug("Adjusting stock for product {} by {}", id, adjustment);

        Product product = productService.adjustStock(id, adjustment);
        ProductResponse response = mapper.toResponse(product);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Stock adjusted successfully")
        );
    }
}
```

### 5. Validator Example

```java
@Component
public class ProductValidator implements BusinessValidator<Product> {

    @Override
    public ValidationResult validate(Product product, ValidationContext context) {
        ValidationResult result = new ValidationResult();

        // Basic field validation
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            result.addError("name", "Product name is required", "PRODUCT_NAME_REQUIRED");
        }

        if (product.getName() != null && product.getName().length() > 200) {
            result.addError("name", "Product name must not exceed 200 characters", "PRODUCT_NAME_TOO_LONG");
        }

        // Price validation
        if (product.getPrice() == null) {
            result.addError("price", "Price is required", "PRODUCT_PRICE_REQUIRED");
        } else {
            if (product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                result.addError("price", "Price must be greater than zero", "PRODUCT_PRICE_INVALID");
            }

            if (product.getPrice().compareTo(BigDecimal.valueOf(100000)) > 0) {
                result.addWarning("price", "Price is unusually high");
            }
        }

        // Stock validation
        if (product.getStockQuantity() != null && product.getStockQuantity() < 0) {
            result.addError("stockQuantity", "Stock quantity cannot be negative", "PRODUCT_STOCK_INVALID");
        }

        if (product.getStockQuantity() != null && product.getStockQuantity() == 0) {
            result.addWarning("stockQuantity", "Product will be out of stock");
        }

        // Category validation
        if (product.getCategory() != null && !isValidCategory(product.getCategory())) {
            result.addError("category", "Invalid category", "PRODUCT_CATEGORY_INVALID");
        }

        return result;
    }

    private boolean isValidCategory(String category) {
        // Example: validate against allowed categories
        List<String> validCategories = Arrays.asList("Electronics", "Clothing", "Food", "Books", "Other");
        return validCategories.contains(category);
    }
}
```

### 6. Business Rule Example

```java
@BusinessRule(
    name = "product-price-validation",
    priority = 10,
    description = "Validates that product price is within allowed range and follows pricing rules"
)
public class ProductPriceRule implements BusinessRule<Product> {

    private static final BigDecimal MIN_PRICE = BigDecimal.valueOf(0.01);
    private static final BigDecimal MAX_PRICE = BigDecimal.valueOf(100000);
    private static final BigDecimal LUXURY_THRESHOLD = BigDecimal.valueOf(1000);

    @Override
    public String getRuleName() {
        return "product-price-validation";
    }

    @Override
    public RuleResult evaluate(Product product, RuleContext context) {
        BigDecimal price = product.getPrice();

        if (price == null) {
            return RuleResult.fail(
                    getRuleName(),
                    "Price is required",
                    RuleResult.RuleSeverity.ERROR
            );
        }

        // Minimum price check
        if (price.compareTo(MIN_PRICE) < 0) {
            return RuleResult.fail(
                    getRuleName(),
                    "Price must be at least " + MIN_PRICE,
                    RuleResult.RuleSeverity.ERROR
            );
        }

        // Maximum price check
        if (price.compareTo(MAX_PRICE) > 0) {
            return RuleResult.fail(
                    getRuleName(),
                    "Price must not exceed " + MAX_PRICE,
                    RuleResult.RuleSeverity.ERROR
            );
        }

        // Luxury item warning
        if (price.compareTo(LUXURY_THRESHOLD) > 0) {
            return RuleResult.warning(
                    getRuleName(),
                    "Product is classified as luxury item (price > " + LUXURY_THRESHOLD + ")"
            );
        }

        return RuleResult.pass(getRuleName());
    }

    @Override
    public int getPriority() {
        return 10; // High priority
    }

    @Override
    public boolean applies(Product product, RuleContext context) {
        // Always apply this rule
        return true;
    }
}
```

## Configuration

### application.yml

```yaml
enterprise:
  framework:
    enabled: true
    jpa:
      auditing-enabled: true
    events:
      async-enabled: true
    pagination:
      default-page-size: 20
      max-page-size: 100
    entity:
      soft-delete-enabled: true
    validation:
      enabled: true
      fail-fast: false
```

## Standard API Response Format

All endpoints return responses in this format:

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name",
    "price": 99.99
  },
  "error": null,
  "metadata": {
    "requestId": "abc-123"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fieldErrors": [
      {
        "field": "name",
        "message": "Product name is required",
        "code": "PRODUCT_NAME_REQUIRED"
      },
      {
        "field": "price",
        "message": "Price must be greater than zero",
        "code": "PRODUCT_PRICE_INVALID"
      }
    ]
  },
  "metadata": {},
  "timestamp": "2024-01-15T10:30:00"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "content": [
      { "id": 1, "name": "Product 1" },
      { "id": 2, "name": "Product 2" }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 100,
    "totalPages": 5,
    "last": false,
    "first": true,
    "empty": false
  },
  "error": null,
  "metadata": {},
  "timestamp": "2024-01-15T10:30:00"
}
```

## Best Practices

### 1. Entity Design
- Always extend `AbstractAuditableEntity<ID>` for audit support
- Implement `SoftDeletable` for entities that should support soft delete
- Use `@EnterpriseEntity` annotation to document entity features
- Keep entities focused on data structure, move business logic to services

### 2. Service Layer
- Extend `AbstractEnterpriseService<T, ID>` for standard CRUD operations
- Always implement `mergeForUpdate()` to control which fields can be updated
- Use `@EnterpriseService` annotation for consistent transaction management
- Implement validators for complex business rules
- Publish domain events for significant state changes

### 3. Controller Layer
- Extend `AbstractEnterpriseController<T, ID, REQ, RES>` for REST endpoints
- Always implement `buildSpecification()` for search functionality
- Use `@EnterpriseController` for consistent REST configuration
- Keep controllers thin - delegate to services
- Use DTOs (Request/Response) - never expose entities directly

### 4. Validation
- Create dedicated validator classes implementing `BusinessValidator<T>`
- Use field-level errors with error codes for client consumption
- Add warnings for non-critical issues
- Leverage `ValidationContext` for operation-specific validation
- Implement business rules as separate classes for reusability

### 5. Error Handling
- Use `BusinessException` for business logic violations
- Use `ValidationException` for validation failures
- Use `ResourceNotFoundException` when entities are not found
- Always include error codes for client-side error handling
- Provide meaningful error messages

### 6. Events
- Publish events for significant state changes (created, updated, deleted)
- Use `publishAsync()` for non-critical notifications
- Include relevant metadata in events
- Create custom event types for domain-specific events
- Keep event handlers idempotent

## Package Structure

```
{{packageName}}.enterprise.framework/
├── annotation/              # Framework annotations
│   ├── EnterpriseEntity.java
│   ├── EnterpriseService.java
│   ├── EnterpriseController.java
│   ├── BusinessRule.java
│   └── BusinessValidation.java
├── core/                    # Core base classes
│   ├── entity/
│   │   ├── AbstractAuditableEntity.java
│   │   ├── SoftDeletable.java
│   │   └── TenantAware.java
│   ├── repository/
│   │   └── AbstractEnterpriseRepository.java
│   ├── service/
│   │   ├── AbstractEnterpriseService.java
│   │   └── CrudService.java
│   └── controller/
│       └── AbstractEnterpriseController.java
├── dto/                     # Response wrappers and mappers
│   ├── ApiResponse.java
│   ├── PagedResponse.java
│   ├── ErrorDetails.java
│   └── EntityMapper.java
├── validation/              # Validation framework
│   ├── ValidationResult.java
│   ├── ValidationContext.java
│   ├── RuleContext.java
│   ├── RuleResult.java
│   ├── BusinessRule.java
│   └── BusinessValidator.java
├── event/                   # Event system
│   ├── DomainEvent.java
│   ├── AbstractDomainEvent.java
│   ├── EventPublisher.java
│   ├── SpringEventPublisher.java
│   ├── EntityCreatedEvent.java
│   ├── EntityUpdatedEvent.java
│   ├── EntityDeletedEvent.java
│   └── EntitySoftDeletedEvent.java
├── exception/               # Exception handling
│   ├── BusinessException.java
│   ├── ValidationException.java
│   ├── ResourceNotFoundException.java
│   ├── ErrorDetails.java
│   └── GlobalExceptionHandler.java
├── config/                  # Auto-configuration
│   ├── EnterpriseFrameworkAutoConfiguration.java
│   └── FrameworkProperties.java
├── EnterpriseFramework.java # Main facade
└── FRAMEWORK_README.md      # This file
```

## Version

**Enterprise Framework v{{frameworkVersion}}**

Generated with **Enterprise CLI**

---

For complete documentation, see the main project documentation.
