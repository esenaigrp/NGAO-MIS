
export const parsePoint = (pointString: string) => {
  const match = pointString.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!match) return null;

  return {
    lng: parseFloat(match[1]),
    lat: parseFloat(match[2]),
  };
};
