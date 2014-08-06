# complex replacements without resorting to callbacks

import re

def findany(pattern, subject, flags=0):
    p = 0
    for m in re.finditer(pattern, subject, flags):
        s, e = m.start(), m.end()
        if s > p:
            yield None, subject[p:s]
        yield m, m.group(0)
        p = e
    if p < len(subject):
        yield None, subject[p:]


#####################

states = {
    "AL":"Alabama", "AK":"Alaska", "AS":"American Samoa", "AZ":"Arizona", "AR":"Arkansas", "CA":"California",
    "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "DC":"District Of Columbia", "FM":"Federated States Of Micronesia",
    "FL": "Florida", "GA":"Georgia", "GU":"Guam", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana",
    "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME":"Maine", "MH":"Marshall Islands",
    "MD":"Maryland", "MA": "Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri",
    "MT":"Montana", "NE": "Nebraska", "NV":"Nevada", "NH":"New Hampshire", "NJ":"New Jersey", "NM":"New Mexico",
    "NY":"New York", "NC":"North Carolina", "ND":"North Dakota", "MP":"Northern Mariana Islands", "OH":"Ohio",
    "OK":"Oklahoma", "OR":"Oregon", "PW": "Palau", "PA":"Pennsylvania", "PR":"Puerto Rico", "RI":"Rhode Island",
    "SC":"South Carolina", "SD":"South Dakota", "TN": "Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont",
    "VI":"Virgin Islands", "VA":"Virginia", "WA":"Washington", "WV": "West Virginia", "WI":"Wisconsin", "WY":"Wyoming"
}

subj = 'United States (CA - FL - OH - NY - TX - Southeast - Northeast - Midwest)'
trans = ''

for match, text in findany(r'\b[A-Z]{2}\b', subj):
    trans += states[text] if match else text

print trans
