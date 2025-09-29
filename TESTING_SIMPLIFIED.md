# Enterprise CLI - Template di Test Semplificati

## Panoramica

I template di test dell'enterprise-cli sono stati semplificati per eliminare i problemi di configurazione Spring Boot e garantire test affidabili e veloci.

## Template di Test Inclusi

### 1. Test Unitari di Service
**File**: `{{packagePath}}/service/{{domainTitleCase}}ServiceTest.java`

- ✅ **Solo JUnit 5 + Mockito**
- ✅ **Nessun Spring Context**
- ✅ **Veloce e affidabile**
- ✅ **Mock di Repository e Mapper**

```java
@ExtendWith(MockitoExtension.class)
class LoanServiceTest {
    @Mock private LoanRepository repository;
    @Mock private LoanMapper mapper;
    @InjectMocks private LoanServiceImpl service;
}
```

### 2. Test Unitari di Controller
**File**: `{{packagePath}}/controller/{{domainTitleCase}}ControllerTest.java`

- ✅ **Solo JUnit 5 + Mockito**
- ✅ **Nessun @WebMvcTest**
- ✅ **Test diretti dei metodi del controller**
- ✅ **Mock del Service**

```java
@ExtendWith(MockitoExtension.class)
class LoanControllerTest {
    @Mock private LoanService service;
    @InjectMocks private LoanController controller;
}
```

### 3. Test di Repository
**File**: `{{packagePath}}/repository/{{domainTitleCase}}RepositoryTest.java`

- ✅ **@DataJpaTest semplice**
- ✅ **Solo database H2**
- ✅ **TestEntityManager per setup**
- ✅ **Test basic CRUD**

```java
@DataJpaTest
@ActiveProfiles("test")
class LoanRepositoryTest {
    @Autowired private LoanRepository repository;
    @Autowired private TestEntityManager entityManager;
}
```

### 4. Test di Avvio Applicazione
**File**: `{{packagePath}}/{{serviceNameTitleCase}}ApplicationTest.java`

- ✅ **@SpringBootTest minimale**
- ✅ **Solo verifica che l'app si avvii**
- ✅ **Nessuna configurazione complessa**

```java
@SpringBootTest(classes = LoanApplication.class)
@ActiveProfiles("test")
class LoanApplicationTest {
    @Test
    void shouldLoadApplicationContextSuccessfully() {
        // Context loading verification
    }
}
```

## Vantaggi della Semplificazione

### ❌ Eliminati i Problemi
- ✅ Nessun conflitto di Spring autoconfiguration
- ✅ Nessun problema con MockBean duplicati
- ✅ Nessun issue con Mockito agent su Java 25+
- ✅ Nessun problema di Spring context loading
- ✅ Nessun conflitto di ErrorMvcAutoConfiguration

### ✅ Benefici Ottenuti
- ⚡ **Test veloci**: Nessun caricamento Spring context
- 🔧 **Test affidabili**: Meno dipendenze = meno punti di rottura
- 📝 **Test semplici**: Facili da leggere e modificare
- 🚀 **Test stabili**: Compatibili con tutte le versioni Java

## Linee Guida per l'Uso

### Test che DOVRESTI scrivere:
- ✅ Logica di business nei service
- ✅ Mapping di dati nei controller
- ✅ Query custom nei repository
- ✅ Validazione dati

### Test che NON devi scrivere nei template base:
- ❌ Test di integrazione complessi
- ❌ Test end-to-end
- ❌ Test di sicurezza
- ❌ Test di performance

### Come estendere i test:

1. **Per test HTTP completi**, aggiungi manualmente:
   ```java
   @SpringBootTest
   @AutoConfigureMockMvc
   class CustomIntegrationTest {
       @Autowired MockMvc mockMvc;
   }
   ```

2. **Per test con database reale**, aggiungi:
   ```java
   @SpringBootTest
   @Testcontainers
   class DatabaseIntegrationTest {
       @Container
       static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:14");
   }
   ```

## Esecuzione Test

```bash
# Solo test unitari (veloce)
mvn test

# Con coverage
mvn test -P coverage

# Solo test di integrazione (se aggiunti)
mvn test -P integration
```

## Risultato

I template generano ora test che:
- ✅ Compilano sempre
- ✅ Eseguono velocemente
- ✅ Non hanno dipendenze complesse
- ✅ Sono facilmente estendibili
- ✅ Funzionano con qualsiasi versione Java/Spring

**L'obiettivo è avere una base solida e semplice che funzioni sempre, che gli sviluppatori possano poi estendere secondo le loro esigenze specifiche.**