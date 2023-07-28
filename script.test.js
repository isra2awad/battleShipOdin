test("hi", () => {
  let valid;
  let width = 10;

  let shipCells = [82, 92, 102];
  let isHoriontal = true;

  if (isHoriontal) {
    shipCells.every(
      (_shipCell, index) =>
        (valid =
          shipCells[0] % width !== width - (shipCells.length - (index + 1)))
    );
  } else {
    shipCells.every(
      (_shipCell, index) => (valid = shipCells[0] < 90 + (width * index + 1))
    );
  }
  expect(valid).toBe(false);
});
