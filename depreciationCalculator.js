function calculateDepreciation(acquisitionCost, usefulLife, depreciationEffectiveDate, depreciatedToFiscalYear, retiredDate) {
  // Convert the effective date to a Date object and set time to midnight
  const depreciationEffectiveDateObj = new Date(depreciationEffectiveDate + 'T00:00:00');

  // Create the end date for the fiscal year up to which depreciation is calculated
  const depreciatedToDate = new Date(depreciatedToFiscalYear, 5, 30); // Month is 0-indexed in JavaScript

  // Calculate monthly depreciated amount
  const monthlyDeprecAmount = acquisitionCost / (usefulLife * 12);

  // Maximum depreciable months for the asset to depreciate
  let maxDepreciatedMonths = usefulLife * 12;
  
  // Check if retired date is provided and adjust depreciatedToDate accordingly
    if (retiredDate !== "") {
    	// # Reconsider maximum depreciable months if an retired_date exist
      const retiredDateObj = new Date(retiredDate + 'T00:00:00');
      // Calculate total months from depreciation start to retired date
      let totalMonthsTillRetire = (retiredDateObj.getFullYear() - depreciationEffectiveDateObj.getFullYear()) * 12 +
      retiredDateObj.getMonth() - depreciationEffectiveDateObj.getMonth() + 1;
      // retire date should not predate depreciation effective date, do not handle if it happens
      if (retiredDateObj <= depreciationEffectiveDateObj){
      	// @TODO proper error handling required
        totalMonthsTillRetire = 0;
      }
        
      if (maxDepreciatedMonths > totalMonthsTillRetire){
      	// asset would retire before being fully depreciated
        maxDepreciatedMonths = totalMonthsTillRetire;
      }
    }


  // Number of depreciated months since depreciation effective date
  let totalDepreciatedMonths;
  if (depreciatedToDate <= depreciationEffectiveDateObj) {
    totalDepreciatedMonths = 0;
  } else {
    totalDepreciatedMonths = (depreciatedToDate.getFullYear() - depreciationEffectiveDateObj.getFullYear()) * 12 +
      depreciatedToDate.getMonth() - depreciationEffectiveDateObj.getMonth() + 1;
  }

  // Determine current fiscal year depreciated months
  let currentYearDeprecMonths;
  if (totalDepreciatedMonths > maxDepreciatedMonths) {
    // Consider when the asset was fully depreciated
    if (totalDepreciatedMonths - maxDepreciatedMonths < 12) {
      // asset fully depreciated during depreciated_to_fiscal_year
      currentYearDeprecMonths = 12 - (totalDepreciatedMonths - maxDepreciatedMonths)
    } else {
      // asset fully depreciated before depreciated_to_fiscal_year
      currentYearDeprecMonths = 0;
    }
    // Total depreciated months cannot exceed maximum depreciable months
    totalDepreciatedMonths = maxDepreciatedMonths;
  } else {
    // Asset has book value left to depreciate and it can depreciated up to 12 months only for a fiscal year
    currentYearDeprecMonths = Math.min(12, totalDepreciatedMonths);
  }

  // Calculate accumulated depreciated amount
  const totalDeprecAmount = parseFloat((monthlyDeprecAmount * totalDepreciatedMonths).toFixed(2));

  // Calculate current fiscal year depreciated amount
  const currentYearDeprecAmount = parseFloat((monthlyDeprecAmount * currentYearDeprecMonths).toFixed(2));

  // Calculate current value
  const currentValue = acquisitionCost - totalDeprecAmount;

  return {
    currentYearDeprecMonths: currentYearDeprecMonths,
    totalDepreciatedMonths: totalDepreciatedMonths,
    currentYearDeprecAmount: currentYearDeprecAmount,
    totalDeprecAmount: totalDeprecAmount,
    currentValue: currentValue
  };
}

function handleSubmit(event) {
  event.preventDefault();

  const acquisitionCost = parseFloat(document.getElementById('acquisitionCost').value);
  const usefulLife = parseFloat(document.getElementById('usefulLife').value);
  const depreciationEffectiveDate = document.getElementById('depreciationEffectiveDate').value;
  const depreciatedToFiscalYear = parseInt(document.getElementById('depreciatedToFiscalYear').value);
  const retiredDate = document.getElementById('retiredDate').value;

  const result = calculateDepreciation(acquisitionCost, usefulLife, depreciationEffectiveDate, depreciatedToFiscalYear, retiredDate);

  document.getElementById('currentYearDeprecAmount').innerText = result.currentYearDeprecAmount.toFixed(2);
  document.getElementById('totalDeprecAmount').innerText = result.totalDeprecAmount.toFixed(2);
  document.getElementById('currentValue').innerText = result.currentValue.toFixed(2);
  document.getElementById('currentYearDeprecMonths').innerText = result.currentYearDeprecMonths.toFixed(0);
  document.getElementById('totalDepreciatedMonths').innerText = result.totalDepreciatedMonths.toFixed(0);
  
  // Show results after calculation
  document.querySelector('h3').classList.remove('hidden');
  document.getElementById('results').classList.remove('hidden');
}
