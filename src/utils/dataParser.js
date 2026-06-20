export const parseVehicleData = (rawData) => {
  if (!Array.isArray(rawData)) return [];
  
  return rawData.map(item => {
    const rawDate = String(item["Date"] || '');
    const parseSheetNum = (val) => parseFloat(String(val || '0').replace(/,/g, '')) || 0;

    const openKms = parseSheetNum(item["Opening kms"]);
    const closeKms = parseSheetNum(item["Closing kms"]);
    let kmsRun = parseSheetNum(item["Kms"]);
    if (closeKms > openKms && kmsRun === 0) {
      kmsRun = closeKms - openKms;
    }

    let revenue = parseSheetNum(item["Total"]);
    if (revenue === 0) {
      revenue = parseSheetNum(item["Transportation Charges"]) + parseSheetNum(item["Halting Charges"]);
    }

    const cost = parseSheetNum(item["Cost"]);
    const emi = parseSheetNum(item["EMI"]);
    const received = parseSheetNum(item["Payment Received"]);

    return {
      ...item,
      cleanDate: rawDate,
      vehicleNo: String(item["Vehicle No."] || '').trim(),
      truckType: item["Type Of Truck"] || 'Other',
      status: item["Contract Status"] || item["Trip Status"] || 'COMPLETE',
      kms: kmsRun,
      revenue,
      cost,
      emi,
      received,
      pending: revenue - received
    };
  }).filter(item => 
    item.vehicleNo !== 'UNKNOWN' && 
    item.vehicleNo !== '' && 
    item.vehicleNo !== 'Vehicle No.' && 
    !item.vehicleNo.toLowerCase().includes('total')
  );
};
