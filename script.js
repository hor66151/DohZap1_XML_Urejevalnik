let xmlDoc;

document.getElementById('xmlFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(e.target.result, "text/xml");
        populateFormFields();
    };
    reader.readAsText(file);
});

function populateFormFields() {
    const basicContainer = document.getElementById('basicDataContainer');
    const incomeContainer = document.getElementById('incomeDataContainer');
    basicContainer.innerHTML = '';
    incomeContainer.innerHTML = '';

    // Basic Data
    const basicFields = ["TaxYear", "PeriodMonthFrom", "PeriodYearFrom", "PeriodMonthTo", "PeriodYearTo", "PaymentDate"];
    const dohZap1 = xmlDoc.getElementsByTagName("DohZap1")[0];
    populateFields(dohZap1, basicFields, basicContainer);

    // Income Data
    const incomeFields = ["PaymentDate", "PeriodFromMonth", "PeriodFromYear", "PeriodToMonth", "PeriodToYear", "Income", "Contribution"];
    const incomeData = dohZap1.getElementsByTagName("IncomeData")[0];
    if (incomeData) {
        populateFields(incomeData, incomeFields, incomeContainer);
    }
}

function populateFields(xmlElement, fields, container) {
    fields.forEach(field => {
        const element = xmlElement.getElementsByTagName(field)[0];
        if (element) {
            const label = document.createElement('label');
            label.textContent = field + ": ";
            const input = document.createElement('input');
            input.type = 'text';
            input.value = element.textContent;
            input.onchange = () => { element.textContent = input.value; }; // Update XML directly on change
            container.appendChild(label);
            container.appendChild(input);
            container.appendChild(document.createElement('br'));
        }
    });
}

function downloadModifiedXML() {
    const serializer = new XMLSerializer();
    const xmlString = serializer.serializeToString(xmlDoc);
    const formattedXml = formatXML(xmlString);
    const blob = new Blob([formattedXml], {type: "application/xml"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified.xml';
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function formatXML(xml) {
    let formatted = '', indent = '';
    const spaces = 4;
    xml.split(/>\s*</).forEach(node => {
        if (node.match(/^\/\w/)) indent = indent.substring(spaces);
        formatted += indent + '<' + node + '>\r\n';
        if (node.match(/^<?\w[^>]*[^\/]$/)) indent += ' '.repeat(spaces);
    });
    return formatted.substring(1, formatted.length-3);
}
