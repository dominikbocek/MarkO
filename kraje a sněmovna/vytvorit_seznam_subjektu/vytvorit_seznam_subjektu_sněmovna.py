def seznam(dosouboru = False):
    f=pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\psrkl.csv", delimiter=";", encoding="cp1250", dtype={"STAVREG": str})
    f = f.sort_values(['KSTRANA'])
    f = f[f["STAVREG"].astype('str').str.contains("0")]
    bezregistrace = f[~f["STAVREG"].astype('str').str.contains("0")].index.astype(str).to_list()
    keep_col = ['KSTRANA','VSTRANA','ZKRATKAK30','ZKRATKAK8']
    new_f = f[keep_col]
    new_f.drop_duplicates(inplace = True)
    new_f["KSTRANA"] = range(1, len(new_f.index) + 1)

    if not dosouboru:
            return bezregistrace
    
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")
    new_f.to_csv("parties.csv", index=False)
    if not os.path.exists("parties-univerzal.csv"):
        shutil.copyfile("parties.csv", "parties2.csv")
        shutil.copyfile("parties.csv", "parties-univerzal.csv")