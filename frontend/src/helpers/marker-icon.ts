export const getMarkerIcon = (status: string) => {
  if (status === "urgent") {
    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }
  if (status === "resolved") {
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  }
  return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // reported
};
