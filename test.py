import tkinter as tk

root = tk.Tk()
root.title("Lista gostiju")
root.geometry("380x320")

# StringVar za dinamički status na dnu — labela se sama osvježi pri .set()
status = tk.StringVar(value="Spremno.")
# BooleanVar za checkbutton "potvrdi prije dodavanja"
potvrdjuj = tk.BooleanVar(value=False)

def dodaj():
    ime = entry.get().strip()
    if not ime:
        status.set("Unesi ime prije dodavanja.")
        return
    if potvrdjuj.get():
        # Demo: kratko logovanje umjesto pravog dijaloga (vidimo u status liniji)
        status.set(f"Potvrda za '{ime}'? Pretpostavljam Da.")
    listbox.insert(tk.END, ime)
    entry.delete(0, tk.END)                  # ispražnji unos
    status.set(f"Dodano: {ime} (ukupno {listbox.size()})")

def obrisi_oznaceno():
    izbor = listbox.curselection()
    if not izbor:
        # curselection() vraća prazan tuple ako ništa nije označeno
        status.set("Označi stavku za brisanje.")
        return
    ime = listbox.get(izbor[0])
    listbox.delete(izbor[0])
    status.set(f"Obrisano: {ime}")

def obrisi_sve():
    listbox.delete(0, tk.END)                # tk.END = do kraja liste
    status.set("Lista očišćena.")

# Forma — grid layout u Frame-u (jedan Frame = jedan layout menadžer)
forma = tk.Frame(root)
forma.pack(pady=10, padx=10, fill="x")

tk.Label(forma, text="Ime gosta:").grid(row=0, column=0, sticky="w")
entry = tk.Entry(forma, width=25)
entry.grid(row=0, column=1, padx=5)
tk.Button(forma, text="Dodaj", command=dodaj).grid(row=0, column=2)

# Checkbutton — vezan za BooleanVar, vrijednost čita kroz .get()
tk.Checkbutton(forma, text="Traži potvrdu",
               variable=potvrdjuj).grid(row=1, column=0, columnspan=3, sticky="w")

# Lista — pack unutar root-a (root koristi pack, posebno od forme koja koristi grid)
listbox = tk.Listbox(root, height=8)
listbox.pack(fill="both", expand=True, padx=10)

# Dugmad u svom Frame-u, pack side="left" pravi horizontalni red
dugmad = tk.Frame(root)
dugmad.pack(pady=5)
tk.Button(dugmad, text="Obriši označeno", command=obrisi_oznaceno).pack(side="left", padx=4)
tk.Button(dugmad, text="Obriši sve",       command=obrisi_sve).pack(side="left", padx=4)

# Status — vezan za StringVar, automatsko ažuriranje pri svakoj status.set(...)
tk.Label(root, textvariable=status, fg="gray").pack(side="bottom", pady=4)

entry.focus()                                # kursor odmah u polje (UX)

root.mainloop()