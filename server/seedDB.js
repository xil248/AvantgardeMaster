const mongoose = require('mongoose');
const DataModel = require('./models/data.schema');
const data = require('../client/data/data');

mongoose.connect('mongodb://localhost:27017/avantgarde');

mongoose.Promise = global.Promise;

data.forEach(entry => {
  DataModel.create({
    SequenceID: entry.SequenceID,
    PrimaryStudyID: entry.PrimaryStudyID,
    AEIDRPID: entry.AEIDRPID,
    PrimaryStudy: entry.PrimaryStudy,
    otherID: entry.otherID,
    EnrollmentDate: new Date(entry.EnrollmentDate),
    segpresent: entry.segpresent,
    "SDTJ_0.01_DEG": entry["SDTJ_0.01_DEG"],
    "SDTJ_0.015_DEG": entry["SDTJ_0.015_DEG"],
    "LANL_0.01_DEG": entry["LANL_0.01_DEG"],
    "LANL_0.015_DEG": entry["LANL_0.015_DEG"],
    "SDTJ_0.01": entry["SDTJ_0.01"],
    "SDTJ_0.015": entry["SDTJ_0.015"],
    "LANL_0.01": entry["LANL_0.01"],
    "LANL_0.015": entry["LANL_0.015"],
    Age: entry.Age,
    Sex: entry.Sex,
    Race: entry.Race,
    SexualOrient: entry.SexualOrient,
    NeedleSharing: entry.NeedleSharing,
    heroin: entry.heroin,
    Meth: entry.Meth,
    Alcohol: entry.Alcohol,
  })
    .then(console.log)
    .catch(console.err);
});