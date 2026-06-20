# AYBU Staj Report - LaTeX build
MAIN = main

.PHONY: build clean preview

build:
	pdflatex -interaction=nonstopmode $(MAIN).tex
	pdflatex -interaction=nonstopmode $(MAIN).tex

preview: build
	cp $(MAIN).pdf template-preview.pdf

clean:
	rm -f *.aux *.log *.out *.toc *.lof *.lot *.fls *.fdb_latexmk *.synctex.gz
