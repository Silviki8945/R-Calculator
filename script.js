/**
 * Crop Yield Prediction Script
 * * Rewritten for better readability, modern JS standards, and to fix the Maize NaN calculation error.
 * All original prediction formulas and core logic have been maintained, 
 * and the Gram formula has been updated with the user-provided coefficients.
 */
(function () {
    // --- 1. DOM Element Caching ---
    // General elements
    const cropSelect = document.getElementById("crop");
    const predictBtn = document.getElementById("predictBtn");
    const errorMsg = document.getElementById("errorMsg");
    const resultInput = document.getElementById("result");

    // Tur/Maize shared elements
    const turMaizeInputs = document.getElementById("turMaizeInputs");
    const tmArea = document.getElementById("tmArea");
    const tmRainfall = document.getElementById("tmRainfall");
    const tmFert = document.getElementById("tmFert");

    // Maize specific elements
    const maizeManagement = document.getElementById("maizeManagement");
    const managementSelect = document.getElementById("management");

    // Gram specific elements
    const gramInputs = document.getElementById("gramInputs");
    const gRainSep = document.getElementById("gRainSep");
    const gRainOct = document.getElementById("gRainOct");
    const gRainNov = document.getElementById("gRainNov");
    const gArea = document.getElementById("gArea");
    const gFert = document.getElementById("gFert");

    // --- 2. Utility Functions ---

    /**
     * Parses the value of an input element to a floating-point number.
     * @param {HTMLInputElement} input - The input element.
     * @returns {number | null} The parsed number or null if invalid.
     */
    function parseNumber(input) {
        // Use optional chaining and nullish coalescing for safety
        const val = parseFloat(input?.value ?? '');
        return isNaN(val) ? null : val;
    }

    /**
     * Displays an error message to the user.
     * @param {string} msg - The error message to display.
     */
    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = "block";
        resultInput.value = ""; // Ensure result is clear on error
    }

    /**
     * Clears the error message and the result field.
     */
    function clearErrorAndResult() {
        errorMsg.style.display = "none";
        errorMsg.textContent = "";
        resultInput.value = "";
    }

    // --- 3. Event Listeners ---

    // Show/hide input sections based on the selected crop
    cropSelect.addEventListener("change", () => {
        clearErrorAndResult();
        const crop = cropSelect.value;

        // Hide all sections initially
        turMaizeInputs.style.display = "none";
        maizeManagement.style.display = "none";
        gramInputs.style.display = "none";

        // Show relevant sections
        if (crop === "tur" || crop === "maize") {
            turMaizeInputs.style.display = "block";
        }
        if (crop === "maize") {
            maizeManagement.style.display = "block";
        }
        if (crop === "gram") {
            gramInputs.style.display = "block";
        }
    });

    predictBtn.addEventListener("click", predict);

    // --- 4. Main Prediction Logic ---

    function predict() {
        clearErrorAndResult();

        const crop = cropSelect.value;
        if (!crop) {
            showError("Please select a crop.");
            return;
        }

        let predictedYield = 0;
        let label = "";

        switch (crop) {
            case "tur": {
                const area = parseNumber(tmArea);
                const rain = parseNumber(tmRainfall);
                const fert = parseNumber(tmFert);

                // Validation
                if (area === null || area <= 0) {
                    showError("Enter a valid positive area for Tur.");
                    return;
                }
                if (rain === null || rain < 0) {
                    showError("Enter rainfall (mm) for Tur.");
                    return;
                }
                if (fert === null || fert < 0) {
                    showError("Enter fertilizers (kg) for Tur.");
                    return;
                }

                // Tur formula (Original regression maintained)
                predictedYield = -3.32843850766629 + 
                                 (0.00459239788361382 * rain) + 
                                 (4.33370044211268 * area) + 
                                 (0.0763918341341603 * fert);

                label = " (Tur)";
                break;
            }

            case "maize": {
                // Correctly use the Maize variables defined in this case block
                const areaM = parseNumber(tmArea);
                const rainM = parseNumber(tmRainfall);
                const fertM = parseNumber(tmFert);
                const mgmt = managementSelect.value; // good / poor

                // Validation
                if (areaM === null || areaM <= 0) {
                    showError("Enter a valid positive area for Maize.");
                    return;
                }
                if (rainM === null || rainM < 0) {
                    showError("Enter rainfall (mm) for Maize.");
                    return;
                }
                if (fertM === null || fertM < 0) {
                    showError("Enter fertilizers (kg) for Maize.");
                    return;
                }
                if (!mgmt) {
                    showError("Select quality of management for Maize.");
                    return;
                }

                // Base Maize formula (Original regression maintained)
                const baseMaize = -23.81399768 + 
                                  (0.039441256 * rainM) + 
                                  (13.03528484 * areaM) + 
                                  (0.031329566 * fertM);

                let mgmtFactor = 1.0;
                
                if (mgmt === "poor") {
                    mgmtFactor = 0.75;
                    label = " (Maize, Poor management)";
                } else { // mgmt === "good" (using 1.0 as per original code logic)
                    mgmtFactor = 1.0; 
                    label = " (Maize, Good management)";
                }
                
                predictedYield = baseMaize * mgmtFactor;
                break;
            }

            case "gram": {
                const rSep = parseNumber(gRainSep);
                const rOct = parseNumber(gRainOct);
                const rNov = parseNumber(gRainNov);
                const areaG = parseNumber(gArea);
                const fertG = parseNumber(gFert);

                // Validation
                if (rSep === null || rSep < 0 || rOct === null || rOct < 0 || rNov === null || rNov < 0) {
                    showError("Enter rainfall for September, October, and November for Gram.");
                    return;
                }
                if (areaG === null || areaG <= 0) {
                    showError("Enter a valid positive area for Gram.");
                    return;
                }
                if (fertG === null || fertG < 0) {
                    showError("Enter fertilizers (kg) for Gram.");
                    return;
                }

                // New Gram formula implemented using correct local variable names
                predictedYield = 
                    57.91029391 + 
                    (9.450850118 * areaG) +          // Use areaG (Area)
                    (-0.577080551 * rSep) +          // Use rSep (Rain Sep)
                    (0.069920447 * rOct) +           // Use rOct (Rain Oct)
                    (0.278021178 * rNov) +           // Use rNov (Rain Nov)
                    (-0.006839212 * fertG);          // Use fertG (Fertilizer)

                label = " (Gram)";
                break;
            }

            default:
                showError("No formula defined for this crop.");
                return;
        }

        // Final Result Formatting
        if (predictedYield < 0) {
            predictedYield = 0;
        }

        // Round to 2 decimal places
        predictedYield = Math.round(predictedYield * 100) / 100;
        resultInput.value = `${predictedYield} quintals (approx.)${label}`;
    }
})();