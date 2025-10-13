// import axios from "axios";

// /**
//  * Fetch real drug data from OpenFDA API
//  * Example search: Paracetamol, Amoxicillin, etc.
//  */
// export const fetchDrugData = async (drugName) => {
//   try {
//     const url = `https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:${drugName}&limit=1`;

//     const { data } = await axios.get(url);

//     if (!data.results || data.results.length === 0) {
//       return null;
//     }

//     const result = data.results[0];

//     // Structure for your local DB
//     return {
//       name: result.openfda.brand_name?.[0] || "Unknown",
//       manufacturer: result.openfda.manufacturer_name?.[0] || "Unknown",
//       productType: result.openfda.product_type?.[0] || "Drug",
//       approvalDate: result.approval_date || "N/A",
//     };
//   } catch (error) {
//     console.error("❌ OpenFDA fetch error:", error.message);
//     return null;
//   }
// };
import axios from "axios";

/**
 * Fetch real drug data from OpenFDA API
 * Example search: Paracetamol, Amoxicillin, etc.
 */
export const fetchDrugData = async (drugName) => {
  try {
    // URL encode the drug name and convert to lowercase for better matching
    const encodedDrugName = encodeURIComponent(drugName.trim());
    
    // Try searching in multiple fields for better results
    const url = `https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:"${encodedDrugName}"+openfda.generic_name:"${encodedDrugName}"&limit=1`;

    const { data } = await axios.get(url);

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];

    // Structure for your local DB
    return {
      name: result.openfda.brand_name?.[0] || result.openfda.generic_name?.[0] || "Unknown",
      manufacturer: result.openfda.manufacturer_name?.[0] || "Unknown",
      productType: result.openfda.product_type?.[0] || "Drug",
      approvalDate: result.products?.[0]?.active_ingredients?.[0]?.strength || "N/A",
    };
  } catch (error) {
    console.error("❌ OpenFDA fetch error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    return null;
  }
};