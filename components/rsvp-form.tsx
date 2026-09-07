"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { rsvpSchema, type RsvpFormValues } from "@/lib/validations/rsvp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export function RsvpForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [attendedOnSuccess, setAttendedOnSuccess] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      willAttend: true,
      fullName: "",
      email: "",
      guestCount: 1,
      messageForBaby: "",
      dietaryRestrictions: "",
      allowPublicMessage: false,
    },
  });

  const messageValue = form.watch("messageForBaby") ?? "";
  const willAttend = form.watch("willAttend");

  async function onSubmit(values: RsvpFormValues) {
    setServerError(null);
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message ?? "Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      setAttendedOnSuccess(values.willAttend);
      setIsSuccess(true);
    } catch {
      setServerError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
    }
  }

  if (isSuccess) {
    return (
      <Card className="border-primary/20 bg-primary/5 text-center animate-fade-up">
        <CardContent className="flex flex-col items-center gap-4 p-10">
          <PartyPopper className="h-12 w-12 text-primary" />
          <h2 className="font-display text-2xl font-semibold">
            {attendedOnSuccess ? "Merci pour votre réponse !" : "Merci de nous l'avoir dit !"}
          </h2>
          <p className="max-w-sm text-muted-foreground">
            {attendedOnSuccess
              ? "Votre confirmation a bien été enregistrée. On a très hâte de célébrer avec vous !"
              : "Votre réponse a bien été enregistrée. On pensera fort à vous ce jour-là !"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-3">
        <Label id="willAttend-label">Serez-vous présent·e ? *</Label>
        <RadioGroup
          aria-labelledby="willAttend-label"
          value={willAttend ? "oui" : "non"}
          onValueChange={(value) => form.setValue("willAttend", value === "oui")}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-colors ${
              willAttend ? "border-primary bg-primary/5" : "border-input"
            }`}
          >
            <RadioGroupItem value="oui" id="willAttend-oui" />
            Oui, je serai présent·e
          </label>
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-colors ${
              !willAttend ? "border-primary bg-primary/5" : "border-input"
            }`}
          >
            <RadioGroupItem value="non" id="willAttend-non" />
            Non, je ne pourrai pas être présent·e
          </label>
        </RadioGroup>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="fullName">Nom complet *</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Votre nom et prénom"
          aria-invalid={!!form.formState.errors.fullName}
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName && (
          <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Courriel *</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          aria-invalid={!!form.formState.errors.email}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      {willAttend && (
        <div className="grid gap-2">
          <Label htmlFor="guestCount">Nombre de personnes (vous inclus·e) *</Label>
          <Select
            defaultValue="1"
            onValueChange={(value) => form.setValue("guestCount", Number(value), { shouldValidate: true })}
          >
            <SelectTrigger id="guestCount" aria-invalid={!!form.formState.errors.guestCount}>
              <SelectValue placeholder="Sélectionnez" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {n === 1 ? "personne" : "personnes"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.guestCount && (
            <p className="text-sm text-destructive">{form.formState.errors.guestCount.message}</p>
          )}
        </div>
      )}

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="messageForBaby">Message pour bébé (optionnel)</Label>
          <span className="text-xs text-muted-foreground">{messageValue.length}/500</span>
        </div>
        <Textarea
          id="messageForBaby"
          maxLength={500}
          placeholder="Un petit mot doux, un conseil ou un vœu pour le bébé..."
          {...form.register("messageForBaby")}
        />
        {form.formState.errors.messageForBaby && (
          <p className="text-sm text-destructive">
            {form.formState.errors.messageForBaby.message}
          </p>
        )}
      </div>

      {willAttend && (
        <div className="grid gap-2">
          <Label htmlFor="dietaryRestrictions">
            Allergies ou restrictions alimentaires (optionnel)
          </Label>
          <Input
            id="dietaryRestrictions"
            placeholder="Ex : végétarien, allergie aux arachides..."
            {...form.register("dietaryRestrictions")}
          />
        </div>
      )}

      <label className="flex items-start gap-3 rounded-xl bg-muted/60 p-4 text-sm">
        <Checkbox
          id="allowPublicMessage"
          onCheckedChange={(checked) =>
            form.setValue("allowPublicMessage", checked === true)
          }
        />
        <span>
          J&apos;accepte que mon message pour bébé soit affiché publiquement sur la page
          d&apos;accueil.
        </span>
      </label>

      {serverError && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />{" "}
            {willAttend ? "Confirmer ma présence" : "Envoyer ma réponse"}
          </>
        )}
      </Button>
    </form>
  );
}
