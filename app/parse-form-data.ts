type FormDataValue = string | string[] | Record<string, FormDataValue>;
type FormDataArray = Array<string | Record<string, FormDataValue>>;

export function parseFormData(formData: FormData): Record<string, FormDataValue> {
  const result: Record<string, FormDataValue> = {};

  for (const [key, value] of formData.entries()) {
    const matches = key.match(/^([^[\]]+)(?:\[([^\[\]]*)\])*$/);
    if (!matches) continue;

    const [, baseKey, arrayKey] = matches;
    const target = result;

    if (!arrayKey) {
      // Simple key-value
      const existing = target[baseKey];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else if (existing !== undefined) {
        target[baseKey] = [existing as string, value];
      } else {
        target[baseKey] = value;
      }
      continue;
    }

    // Handle array notation
    const parts = key.slice(baseKey.length).match(/\[([^\[\]]*)\]/g) || [];
    let current = target;
    let currentKey = baseKey;
    const lastArrayIndex: Record<string, number> = {};

    parts.forEach((part, index) => {
      const stripped = part.slice(1, -1);
      const isLast = index === parts.length - 1;

      // Initialize current key if needed
      if (!current[currentKey]) {
        current[currentKey] = stripped === "" ? [] : {};
      }

      if (isLast) {
        if (stripped === "") {
          (current[currentKey] as FormDataArray).push(value);
        } else {
          (current[currentKey] as Record<string, FormDataValue>)[stripped] = value;
        }
      } else {
        const currentValue = current[currentKey];

        if (stripped === "") {
          // Handle empty brackets
          const nextPart = parts[index + 1]?.slice(1, -1);
          if (!lastArrayIndex[currentKey]) {
            lastArrayIndex[currentKey] = 0;
          }

          if (!Array.isArray(currentValue)) {
            const newArray: FormDataArray = [];
            current[currentKey] = newArray;
            newArray[lastArrayIndex[currentKey]] = nextPart === "" ? [] : {};
            current = newArray[lastArrayIndex[currentKey]] as Record<string, FormDataValue>;
          } else {
            if (!currentValue[lastArrayIndex[currentKey]]) {
              currentValue[lastArrayIndex[currentKey]] = nextPart === "" ? [] : {};
            }
            current = currentValue[lastArrayIndex[currentKey]] as Record<string, FormDataValue>;
          }

          currentKey = String(lastArrayIndex[currentKey]);
          lastArrayIndex[currentKey]++;
        } else {
          current = currentValue as Record<string, FormDataValue>;
          currentKey = stripped;
        }
      }
    });
  }

  return result;
}
