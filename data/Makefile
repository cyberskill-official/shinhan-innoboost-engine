# data/Makefile
# P03-T04 — Reproducible dataset generation
# Usage: make data SEED=42

SEED ?= 42
TSX := npx tsx

.PHONY: data svfc bank securities clean

data: svfc bank securities
	@echo "✓ All datasets generated with SEED=$(SEED)"

svfc:
	@echo "→ Generating SVFC consumer-finance dataset (SEED=$(SEED))..."
	$(TSX) svfc/generator.ts $(SEED)

bank:
	@echo "→ Generating Bank HO Department dataset (SEED=$(SEED))..."
	$(TSX) bank/generator.ts $(SEED)

securities:
	@echo "→ Generating Securities dataset (SEED=$(SEED))..."
	$(TSX) securities/generator.ts $(SEED)

clean:
	@echo "→ Cleaning generated data..."
	rm -f svfc/*.sql svfc/*.csv
	rm -f bank/*.sql bank/*.csv
	rm -f securities/*.sql securities/*.csv
