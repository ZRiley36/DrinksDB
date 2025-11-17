// Map glass types to their corresponding icon files
export const getGlassIcon = (glassType) => {
  if (!glassType) return null;
  
  const glassIconMap = {
    'Martini': '/martini_icon.png',
    'Highball': '/highball_icon.png',
    'Rocks': '/rocks_icon.png',
    'Coupe': '/coupe_icon.png',
    'Hurricane': '/hurricane_icon.png',
    'Copo': '/copo_icon.png',
    'Julep': '/julep_icon.png',
    'Flute': '/flute_icon.png',
  };
  
  return glassIconMap[glassType] || null;
};

